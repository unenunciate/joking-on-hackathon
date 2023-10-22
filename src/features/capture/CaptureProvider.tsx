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
  paused: boolean
  destory: () => Promise<void>
  createClip: () => Promise<[buffer: Buffer, blob: Blob] | null>
  pauseCapture: () => Promise<boolean>
  resumeCapture: () => Promise<boolean>
}

export const CaptureContext = createContext<CaptureContextValue>({
  capture: null,
  loading: true,
  paused: true,
  destory: async () => { console.log('demo logout') },
  createClip: async () => (null),
  pauseCapture: async () => (false),
  resumeCapture: async () => (false),
})

export interface CaptureProviderProps {
  children: React.ReactNode
}

export function CaptureProvider({ children }: CaptureProviderProps) {
  const [capture, setCapture] = useState<Recorder | null>(null)
  const [standbyCapture, setStandbyCapture] = useState<Recorder | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [paused, setPaused] = useState<boolean>(false)

  const session : AuthContextValue = useContext(AuthContext)

  const toast = useToast()

  const destory = useCallback(async () => {
    capture?.stop()
    // posthog.reset()
    // client.cache.reset()
    // Sentry.setUser(null)
    setCapture(null)
    setStandbyCapture(null)
    setLoading(true)
    setPaused(true)
  }, [capture, setCapture, setStandbyCapture])

  const start = useCallback(async () => {
    try {
        if(session.auth?.wallet) {
            await capture?.start()
            setLoading(false)
            setPaused(false)
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
  }, [capture, session, toast, setLoading, setPaused])

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

  const pauseCapture = useCallback(async () => {
    try {
      if (session && capture && !paused) {
          try {
            setPaused(true)
            setLoading(true)
            setCapture(await capture.stop())
            setStandbyCapture(null)
            setLoading(false)
            return true
          } catch (e: any) {
              toast({
                  status: 'error',
                  title: 'Microphone Pause Failed',
                  description: e?.message,
                  isClosable: true,
                  duration: 9000,
              })
              if (process.env.LOG_ERRORS !== 'false') {
                  Sentry.captureException(e)
              }
              return false
          }
          } else {
              throw(new Error('User not logged in or capture not functioning.'))
          }
      } catch (e: any) {
        return false
      }
  }, [capture, session, setCapture, paused, setPaused, setStandbyCapture, setLoading, toast])

  const resumeCapture = useCallback(async () => {
    try {
      if (session && capture && paused) {
          try {
            await capture.start()
            setCapture(capture)
            setStandbyCapture(cloneDeep(capture))
            setLoading(false)
            setPaused(false)
            return true
          } catch (e: any) {
              toast({
                  status: 'error',
                  title: 'Microphone Pause Failed',
                  description: e?.message,
                  isClosable: true,
                  duration: 9000,
              })
              if (process.env.LOG_ERRORS !== 'false') {
                  Sentry.captureException(e)
              }
              return false
          }
          } else {
              throw(new Error('User not logged in or capture not functioning.'))
          }
      } catch (e: any) {
        return false
      }
  }, [capture, session, setCapture, paused, setPaused, setStandbyCapture, setLoading, toast])

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
      if(session?.auth?.wallet && capture && !loading && !paused) {
        start()
      }

      if(session === null && capture !== null) {
        destory()
      }
  }, [session, capture, loading, paused, destory, start])

  const value = useMemo(() => ({
    capture,
    loading,
    paused,
    destory,
    createClip,
    pauseCapture,
    resumeCapture,
  }), [capture, loading, paused, destory, createClip, pauseCapture, resumeCapture])

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
