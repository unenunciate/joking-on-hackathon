import { useRef } from 'react'
import { Box, HStack, Stack, Button, Link as ChakraLink, Spacer } from '@chakra-ui/react'
import moment from 'moment'
import { Joke } from 'features/types'

import useLaughTracker from 'modules/common/useLaughTracker'

export interface JokeBoxProps {
  joke: Joke
}


export function JokeBox({ joke }: JokeBoxProps) {
  const link = `${process.env.POLYBASE_JOKINGON_COLLECTION_EXPLORER_URL}/jokes/${joke.id}`

  const videoRef = useRef<HTMLVideoElement>(null)

  const [setPlaying, setFocused, timeFocused] = useLaughTracker(joke, videoRef)

  return (
    <Box bg='bw.50' borderRadius='md' p={4} key={joke.id}>
      <Stack>
        <Box>
          {joke.title}
        </Box>
        <HStack>
          {joke.timestamp && (
            <Box color='bw.500' fontSize='sm'>
              {moment(joke.timestamp).fromNow()}
            </Box>
          )}
          <Spacer />
            <video ref={videoRef} src={`${joke.video}`} autoPlay={true} muted={true} onPlay={() => {setPlaying(true)}} onPause={() => {setPlaying(false)}} loop={true}>
            </video>
          <Spacer />
          <Button size={'xs'}>
            <ChakraLink isExternal href={link}>
              View on explorer
            </ChakraLink>
          </Button>
        </HStack>
      </Stack>
    </Box>
  )
}
