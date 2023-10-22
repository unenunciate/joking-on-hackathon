import { Stack, Box, Container, VStack, Heading, Link as ChakraLink, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { usePolybase, useCollection } from '@polybase/react'
import { map } from 'lodash'
import { Layout } from 'features/common/Layout'
import { User, Joke } from 'features/types'
import { useAuth } from 'features/users/useAuth'
import { JokeBox } from 'features/joke/Joke'

export function Home() {
  const polybase = usePolybase()

  const { auth } = useAuth()
  /**
  const { data: users } = useCollection<User>(polybase.collection(`${process.env.POLYBASE}/users`))
 */
  const { data: jokes } = useCollection<Joke>(
    auth?.account
      ? polybase.collection(`${process.env.POLYBASE_JOKINGON_COLLECTION}/jokes`)
        .where('account', '==', auth.account)
        .sort('datetime', 'desc')
      : null,
  )

  const jokesEl = map(jokes?.data, ({ data }) => {
    return (
      <JokeBox key={data.id} joke={data} />
    )
  })

  /**
  const usersEl = map(users?.data, ({ data }) => {
    return (
      <Link to={`/profiles/${data.id}`} key={data.id}>
        <Box borderRadius='md' bg='bw.50' p={4}>
          <Stack>
            <Heading size='md'>
              {data?.name ?? 'Anon'}{(auth && (auth?.wallet.getAddressString() === `0x${data.$pk}`)) ? ' (You)' : ''}
            </Heading>
            <Box>
              {data.id}
            </Box>
          </Stack>
        </Box>
      </Link>
    )
  })
  */

  return (
    <Layout>
      <Container size='lg'>
        <VStack align={'left'} spacing={8}>
          <Heading size='lg'>
            This is a demo app for <ChakraLink href='https://jokingon.com'>JokingOn</ChakraLink>: the comedy economy.
          </Heading>
          <Text>
            Many featuers are not implemented or are WIP.
          </Text>
          <Box>
            <Stack spacing='6'>
              {jokesEl}
            </Stack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

