import React, { useState, useEffect, useContext, RefObject } from 'react'

import { useToast } from '@chakra-ui/react'
import * as Sentry from '@sentry/react'

import { CaptureContext } from 'features/capture/CaptureProvider'

import { Joke } from 'features/types'

export interface ExtendedOptions {
  autoPlay?: boolean
  alwaysFocused?: boolean
  currentlyFocused?: boolean
}

export default function useLaughTracker<Joke> (joke: Joke, videoRef : RefObject<HTMLVideoElement> , autoPlay: boolean = true, alwaysFocused: boolean = true, currentlyFocused: boolean = true) : [setPlaying: (state: boolean) => void, setFocused: (state: boolean) => void, timeFocused: number] {
    const [playing, setPlaying] = useState(autoPlay)
    const [focused, setFocused] = useState(alwaysFocused ? true : currentlyFocused ? true : false)
    const [timeFocused, setTimeFocused] = useState(0)

    const [clipsToBeAnalyzed, setClipsToBeAnalyzed] = useState([])

    const {capture, loading, paused, createClip, pauseCapture, resumeCapture} = useContext(CaptureContext)

    const toast = useToast()

    return [setPlaying, setFocused, timeFocused]

}