import React from 'react'
import { Box, HStack, Stack, Button, Link as ChakraLink, Spacer } from '@chakra-ui/react'
import moment from 'moment'
import { Laugh } from 'features/types'

import { POLYBASE_SCHEMA_COLLECTION_EXPLORER_URL } from 'config/polybase'

export interface LaughBoxProps {
  laugh: Laugh
}


export function LaughBox({ laugh }: LaughBoxProps) {
  const link = `${POLYBASE_SCHEMA_COLLECTION_EXPLORER_URL}/laughs/${laugh.id}`

  return (
    <Box bg='bw.50' borderRadius='md' p={4} key={laugh.id}>
      <Stack>
        <Box>
          Laugh #{laugh.id} @ Joke #{laugh.joke}
        </Box>
        <HStack>
          {laugh.timestamp && (
            <Box color='bw.500' fontSize='sm'>
              {moment(laugh.timestamp).fromNow()}
            </Box>
          )}
          <Spacer />
            <Box color='bw.500' fontSize='sm'>
              Verified: {laugh.verified ? 'Yes' : 'No'}
            </Box>
          <Spacer />
            <Box color='bw.500' fontSize='sm'>
              Audio: {laugh.audio}
            </Box>
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
