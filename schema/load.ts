import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'
import { ethPersonalSign } from '@polybase/eth'

// PK, need to establish a PK so we can control updates

const schema = `
@public
collection users {
  id: string; 
  name?: string;
  desc?: string;
  icon?: string;
  pvkey: string;
  $pk: string;

  laughsEarned: number;
  laughedAt: string[];
  laughs: string[];

  @delegate
  $lit: PublicKey;

  @index(account, [laughsEarned, desc]);

  constructor (id: string, pvkey: string) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.pvkey = pvkey;
    this.laughsEarned = 0;
    this.laughedAt = [];
    this.laughs = [];

    this.$lit = ${process.env.LIT_ACTION_PKP};
  }

  setProfile(name?: string, desc?: string) {
    if (this.$pk != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    if (this.name) {
      this.name = name;
    }
    if (this.desc) {
      this.desc = desc;
    }
  }

  addVerifiedLaughEarned() {
    if (this.$lit.toHex() !== ctx.publicKey.toHex()) {
      throw error('Invalid Caller: Function may only be called by Lit Protocal delegated PKP!');
    }

    this.laughsEarned = this.laughsEarned + 1;
  }

  laughVerified(laugh: string, joke: string) {
    if (this.$lit.toHex() !== ctx.publicKey.toHex()) {
      throw error('Invalid Caller: Function may only be called by Lit Protocal delegated PKP!');
    }

    bool found = false;

    this.laughs.foreach((l: PublicKey) => {
      if(l === laugh) {
        found = true;
      }
    })

    if(!found) {
      this.laughs.push(laugh);
      this.laughedAt.push(joke);
    }
  }
}

@public
collection followers {
  id: string;
  follower: string;
  followee: string;
  email?: string;
  $pk: string;

  constructor (follower: string, followee: string) {
    this.id = follower + '/' + followee;
    this.follower = follower;
    this.followee = followee;
    this.$pk = ctx.publicKey.toHex();
  }
}

@public
collection jokes {
  id: string;
  title: string;
  datetime: string;
  account: string;
  video: string;
  laughs: number;
  laughers: PublicKey[];
  $pk: string;

  @delegate
  $lit: PublicKey;

  @index(account, [timestamp, desc]);

  constructor (id: string, account: string, title: string, datetime: string, video: string) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.account = account;
    this.title = title;
    this.datetime = datetime;
    this.video = video;
    this.laughs = 0;
    this.laughers = PublicKey[];

    this.$lit = ${process.env.LIT_ACTION_PKP};
  }

  @call($lit)
  function addVerifiedLaugh(laugher: PublicKey) {
    if (this.$lit.toHex() !== ctx.publicKey.toHex()) {
      throw error('Invalid Caller: Function may only be called by Lit Protocal delegated PKP!');
    }

    bool found = false;

    this.laughers.foreach((l: PublicKey) => {
      if(l === laugher) {
        found = true;
      }
    })

    if(!found) {
      this.laughers.push(laugher);
    }

    this.laughs = this.laughs + 1;
  }
}

@public
collection laughs {
  id: string;
  joke: string;
  datetime: string;
  timestamp: string;
  audio: string;
  proof: string;
  verified: bool;
  $pk: string;

  @delegate
  $lit: PublicKey;

  @index(id, [joke, $pk, timestamp, verified]);

  constructor (id: string, joke: string, datetime: string, timestamp: string, audio: string, proof: string) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.joke = joke;
    this.datetime = datetime;
    this.timestamp = timestamp;
    this.audio = audio;
    this.proof = proof;
    this.verified = false;

    this.$lit = ${process.env.LIT_ACTION_PKP};
  }

  @call($lit)
  verifyLaugh(laugher: PublicKey) {
      if (this.$lit.toHex() !== ctx.publicKey.toHex()) {
        throw error('Invalid Caller: Function may only be called by Lit Protocal delegated PKP!');
      }

      if(!verified) {
        this.verified = true;
      }
  }
}
`

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''

async function load() {
  const db = new Polybase({
    baseURL: `${process.env.REACT_APP_API_URL}/v3`,
    signer: async (data) => {
      const wallet = Wallet.fromPrivateKey(Buffer.from(PRIVATE_KEY, 'hex'))
      return { h: 'eth-personal-sign', sig: ethPersonalSign(wallet.getPrivateKey(), data) }
    },
  })

  if (!PRIVATE_KEY) {
    throw new Error('No private key provided')
  }

  await db.applySchema(schema, 'jokingon/hackathon')

  return 'Schema loaded'
}

load()
  .then(console.log)
  .catch(console.error)
