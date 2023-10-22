export interface User {
  id: string
  name?: string
  desc?: string
  icon?: string
  pvkey: string
  $pk: string
  laughsEarned?: number
  laughedAt?: string[]
  laughs?: string[]
  $lit?: any
}

export interface Follower {
  id: string
  follower: string
  followee: string
  email: string
  $pk: string
}

export interface Joke {
  id: string
  title: string
  timestamp: string
  account: string
  video: string
  laughs: number
  laughers: string[]
  $pk: string
  $lit: any
}

export interface Laugh {
  id: string
  joke: string
  timestamp: string
  audio: string
  proof: string
  verified: boolean
  $pk: string
  $lit: any
}