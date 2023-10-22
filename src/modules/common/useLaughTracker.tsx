import { useState, useEffect, useContext } from 'react'

import { useToast } from '@chakra-ui/react'
import * as Sentry from '@sentry/react'

import { CaptureContext } from 'features/capture/CaptureProvider'

export type ExtendedOptions<R> = {
  autoplay?: boolean
  alwaysFocused?: boolean
}

export default function useLaughTracker<R = unknown, Args extends any[] = any[]>(joke: string, options?: ExtendedOptions<R>) {

    const [playing, setPlaying] = useState(options?.autoplay ?? false)
    const [focused, setFocused] = useState(options?.alwaysFocused ?? false)

    const {capture, loading} = useContext(CaptureContext)

    const toast = useToast()

    return [setPlaying, setFocused];

}