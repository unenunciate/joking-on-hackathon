import React, { useEffect } from 'react'
import {
  Box, Heading, Container,
  VStack, Stack, Input, FormControl, FormLabel, Button,
  FormHelperText,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Layout } from 'features/common/Layout'
import { useDocument, usePolybase } from '@polybase/react'
import { User } from 'features/types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'features/users/useAuth'
import { useAsyncCallback } from 'modules/common/useAsyncCallback'

export function ProfileEdit() {
  const navigate = useNavigate()
  const polybase = usePolybase()
  const { handleSubmit, register, reset } = useForm()

  const { auth } = useAuth()
  const account = auth?.account

  useEffect(() => {
    if (!account) {
      navigate('/')
    }
  }, [account, navigate])

  const { data } = useDocument<User>(
    account ? polybase.collection(`${process.env.POLYBASE_JOKINGON_COLLECTION}/users`).doc(account) : null,
  )

  useEffect(() => {
    if (!data) return
    reset(data.data)
  }, [data, reset])


  const onEdit = useAsyncCallback(async (data) => {
    if (!account) return
    await polybase.collection<User>(`${process.env.POLYBASE_JOKINGON_COLLECTION}/users`).doc(account)
      .call('setProfile', [data.name, data.desc])

    navigate(`/profiles/${account}`)
  })


  return (
    <Layout>
      <VStack>
        <Container maxW='xl' p={4}>
          <Stack spacing={8}>
            <Box>
              <Stack>
                <Heading>
                  Edit profile
                </Heading>
                <Heading size='sm' color='bw.600' fontWeight='normal'>
                  {data?.data?.id}
                </Heading>
              </Stack>
            </Box>
            <Box>
              <form onSubmit={handleSubmit(onEdit.execute)}>
                <Stack spacing={8}>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input type='name' {...register('name')} />
                      <FormHelperText>Your profile name</FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Desc</FormLabel>
                      <Input type='desc' {...register('desc')} />
                      <FormHelperText>Tell people about yourself</FormHelperText>
                    </FormControl>
                  </Stack>
                  <Button type='submit' isLoading={onEdit.loading}>Save</Button>
                </Stack>
              </form>
            </Box>
          </Stack>
        </Container>
      </VStack>
    </Layout>
  )
}
