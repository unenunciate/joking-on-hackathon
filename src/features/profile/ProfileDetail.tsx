import React, { useState } from 'react'
import { Flex, Box, Heading, Container, VStack, Stack, Input, HStack, Button, Spacer, Link as ChakraLink } from '@chakra-ui/react'
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
import { LaughBox } from 'features/laugh/Laugh'

import { POLYBASE_SCHEMA_COLLECTION_EXPLORER_URL, SCHEMA_VERSION_CHUNK } from 'config/polybase'

export function ProfileDetail() {
  const [title, setTitle] = useState('')
  const [video, setVideo] = useState('')

  const { account } = useParams()
  const polybase = usePolybase()

  const { auth } = useAuth()

  const { data } = useDocument<User>(account ? polybase.collection((`${SCHEMA_VERSION_CHUNK}/users`)).record(account) : null)

  const { data: jokes } = useCollection<Joke>(
    account
      ? polybase.collection(`${SCHEMA_VERSION_CHUNK}/jokes`)
        .where('account', '==', account)
        .sort('datetime', 'desc')
      : null,
  )

  const { data: laughs } = useCollection<Laugh>(
    account
      ? polybase.collection(`${SCHEMA_VERSION_CHUNK}/laughs`)
        .where('account', '==', account)
        .sort('datetime', 'desc')
      : null,
  )

  const share = useAsyncCallback(async (e) => {
    e.preventDefault()

    const pk = auth?.wallet?.getPublicKeyString()

    if (!pk || !account) throw new Error('You must be logged in to share a joke')

    const videoIPFSHash = ''

    await polybase.collection<Joke>(`${SCHEMA_VERSION_CHUNK}/jokes`).create([
      nanoid(),
      title,
      moment().toISOString(),
      account,
      videoIPFSHash,
    ])

    setTitle('')
    setVideo('')
  })

  const jokesEl = map(jokes?.data, ({ data }) => {
    return (
      <JokeBox key={data.id} joke={data} />
    )
  })

  const laughsEl = map(laughs?.data, ({ data }) => {
    return (
      <LaughBox key={data.id} laugh={data} />
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
                  <ChakraLink isExternal href={`${POLYBASE_SCHEMA_COLLECTION_EXPLORER_URL}/users/${data?.data?.id}`}> {data?.data?.id} ↗️ </ChakraLink>
                </Heading>
              </Stack>
            </Box>

            <Box>
              {auth?.account === account && (
                  <form onSubmit={share.execute}>
                    <HStack>
                      <Input value={title} placeholder='Write a title...' onChange={(e) => setTitle(e.target.value)} />
                      <Input type='file' value={video} placeholder='Select a video...' onChange={(e) => setVideo(e.target.value)} />
                      <Button type='submit' isLoading={share.loading} onClick={share.execute}>Share</Button>
                    </HStack>
                  </form>
                )}
            </Box>

            <Flex justifyContent={'space-between'} flexDirection={'column'} width={'max'} height={'full'}>
              <Stack spacing={3}>
                <Heading size={'md'}>Jokes</Heading>
                <Stack>
                  {jokesEl}
                </Stack>
              </Stack>

              <Stack spacing={3}>
                <Heading size={'md'}>Laughs</Heading>
                <Stack>
                  {laughsEl}
                </Stack>
              </Stack>
            </Flex>
          </Stack>
        </Container>
      </VStack>
    </Layout>
  )
}
