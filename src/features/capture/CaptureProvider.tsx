import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

import { useToast } from '@chakra-ui/react'
import * as Sentry from '@sentry/react'
// import ReactGA from 'react-ga'
// import posthog from 'posthog-js'

import { Recorder, RecorderOptions } from 'mic-recorder-to-mp3'

import { AuthContext, AuthContextValue } from 'features/users/AuthProvider'

import { cloneDeep } from 'lodash'

export interface CaptureContextValue {
  capture: Recorder | null
  loading: boolean
  destory: () => Promise<void>
  createClip: () => Promise<[buffer: Buffer, blob: Blob] | null>
}

export const CaptureContext = createContext<CaptureContextValue>({
  loading: true,
  capture: null,
  destory: async () => { console.log('demo logout') },
  createClip: async () => (null),
})

export interface CaptureProviderProps {
  children: React.ReactNode
}

export function CaptureProvider({ children }: CaptureProviderProps) {
  const [capture, setCapture] = useState<Recorder | null>(null)
  const [standbyCapture, setStandbyCapture] = useState<Recorder | null>(null)
  const [loading, setLoading] = useState(true)

  const session : AuthContextValue = useContext(AuthContext)

  const toast = useToast()

  const destory = useCallback(async () => {
    capture?.stop()
    // posthog.reset()
    // client.cache.reset()
    // Sentry.setUser(null)
    setCapture(null)
    setStandbyCapture(null)
  }, [capture, setCapture, setStandbyCapture])

  const start = useCallback(async () => {
    try {
        if(session.auth?.wallet) {
            await capture?.start()
            setLoading(false)
        } else {
            throw(new Error('User not logged in.'))
        }
    } catch (e: any) {
        toast({
            status: 'error',
            title: 'Microphone Capture Failed',
            description: e?.message,
            isClosable: true,
            duration: 9000,
        })

        if (process.env.LOG_ERRORS !== 'false') {
            Sentry.captureException(e)
        }
    }
  }, [capture, session, toast])

  const createClip = useCallback(async () => {
      try {
        if (session && capture) {
            try {
              const temp = capture.stop()
              setLoading(true)
              setCapture(standbyCapture)
              setStandbyCapture(null)
              setLoading(false)
              const haltedRecorder = await temp
              setStandbyCapture(haltedRecorder)
              const clip = await haltedRecorder.getMp3()
              return clip
            } catch (e: any) {
                toast({
                    status: 'error',
                    title: 'Microphone Capture Failed',
                    description: e?.message,
                    isClosable: true,
                    duration: 9000,
                })
                if (process.env.LOG_ERRORS !== 'false') {
                    Sentry.captureException(e)
                }
                return null
            }
            } else {
                throw(new Error('User not logged in or capture not functioning.'))
            }
        } catch (e: any) {
          return null
        }
      }, [capture, session, standbyCapture, setCapture, setStandbyCapture, setLoading, toast])

  useEffect(() => {
    // const userId = Cookies.get(userIdPath)
    if(capture === null) {
        const opts : RecorderOptions = {
            bitRate: 128,
        }
        const r = new Recorder(opts)

        setCapture(r)
        setStandbyCapture(cloneDeep(r))
        setLoading(false)
    }
  }, [capture, setCapture, setStandbyCapture, setLoading])

  useEffect(() => {
      if(session?.auth?.wallet && capture && !loading) {
        start()
      }

      if(session === null && capture !== null) {
        destory()
      }
  }, [session, capture, loading, destory, start])

  const value = useMemo(() => ({
    capture,
    loading,
    destory,
    createClip,
  }), [capture, loading, destory, createClip])

  return (
    <CaptureContext.Provider value={value}>
      {children}
    </CaptureContext.Provider>
  )
}

export function decodeTokenUserId(token?: string | null) {
  if (!token) return null
  try {
    const base = token.split('.').pop()
    if (!base) return
    return JSON.parse(window.atob(base))?.id
  } catch (e) {
    return null
  }
}
