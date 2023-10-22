import React, { useState } from 'react'
import { Box, Heading, Container, VStack, Stack, Input, HStack, Button, Spacer, Link as ChakraLink } from '@chakra-ui/react'
import { nanoid } from 'nanoid'
import { map } from 'lodash'
import moment from 'moment'
import { Layout } from 'features/common/Layout'
import { useCollection, useDocument, usePolybase } from '@polybase/react'
import { Joke, User, Laugh } from 'features/types'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from 'features/users/useAuth'
import { useAsyncCallback } from 'modules/common/useAsyncCallback'
import { JokeBox } from 'features/joke/Joke'

export function ProfileDetail() {
  const [title, setTitle] = useState('')
  const [video, setVideo] = useState('')
  const { account } = useParams()
  const polybase = usePolybase()

  const { auth } = useAuth()

  const { data } = useDocument<User>(
    account ? polybase.collection('demo/social/users').record(account) : null,
  )

  const { data: jokes } = useCollection<Joke>(
    account
      ? polybase.collection(`${process.env.POLYBASE_JOKINGON_COLLECTION}/jokes`)
        .where('account', '==', account)
        .sort('timestamp', 'desc')
      : null,
  )

  const { data: laughs } = useCollection<Laugh>(
    account
      ? polybase.collection(`${process.env.POLYBASE_JOKINGON_COLLECTION}/laughs`)
        .where('account', '==', account)
        .sort('timestamp', 'desc')
      : null,
  )

  const share = useAsyncCallback(async (e) => {
    e.preventDefault()
    const pk = auth?.wallet?.getPublicKeyString()
    if (!pk || !account) throw new Error('You must be logged in to share a joke')
    await polybase.collection<Joke>(`${process.env.POLYBASE_JOKINGON_COLLECTION}/jokes`).create([
      nanoid(),
      account,
      title,
      moment().toISOString(),
    ])
    setTitle('')
  })

  const jokesEl = map(jokes?.data, ({ data }) => {
    return (
      <JokeBox key={data.id} joke={data} />
    )
  })

  return (
    <Layout>
      <VStack>
        <Container maxW='xl' p={4}>
          <Stack spacing={8}>
            <Box>
              <Stack>
                <HStack>
                  <Heading>
                    {data?.data?.name ?? 'Annon'}{auth?.account === account ? ' (You)' : ''}
                  </Heading>
                  <Spacer />
                  {auth?.account === account && (
                    <Button size={'xs'}>
                      <Link to='/profiles/edit'>Edit profile</Link>
                    </Button>
                  )}
                </HStack>
                <Heading size='sm' color='bw.600' fontWeight='normal'>
                  <ChakraLink isExternal href={`https://explorer.testnet.polybase.xyz/collections/demo%2Fsocial%2Fusers/${data?.data?.id}`}>{data?.data?.id} ↗️</ChakraLink>
                </Heading>
              </Stack>
            </Box>

            <Box>
              <Stack spacing={3}>
                <Heading size={'md'}>Jokes</Heading>
                {auth?.account === account && (
                  <form onSubmit={share.execute}>
                    <HStack>
                      <Input value={title} placeholder='Write something...' onChange={(e) => setTitle(e.target.value)} />
                      <Button type='submit' isLoading={share.loading} onClick={share.execute}>Share</Button>
                    </HStack>
                  </form>
                )}
                <Stack>
                  {jokesEl}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </VStack>
    </Layout>
  )
}
