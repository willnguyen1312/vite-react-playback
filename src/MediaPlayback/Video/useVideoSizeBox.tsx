import { useState, useCallback, useEffect } from 'react'
import { useEvent } from 'react-use'

import { calculateDimensions, waitForVideoWidth } from '../utils'

export interface useVideoSizeBoxArg {
  videoElement?: HTMLVideoElement
  wrapperElement?: HTMLElement
  isDimensionsSwitched: boolean
}

export const useVideoSizeBox = ({ isDimensionsSwitched, videoElement, wrapperElement }: useVideoSizeBoxArg) => {
  const [videoSizeBox, setVideoSizeBox] = useState<{ width: number; height: number }>({
    height: 0,
    width: 0,
  })

  const updateVideoSizeBox = useCallback(async () => {
    if (!videoElement || !wrapperElement) {
      return
    }

    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new Error('Only video element is supported')
    }

    await waitForVideoWidth(videoElement)
    // Wait 1 tick for React render on fullscreen
    setTimeout(() => {
      const { videoWidth, videoHeight } = videoElement
      const { clientWidth, clientHeight } = wrapperElement

      const { newWidth, newHeight } = calculateDimensions({
        wrapperWidth: clientWidth,
        wrapperHeight: clientHeight,
        videoWidth,
        videoHeight,
        isDimensionsSwitched,
      })

      setVideoSizeBox({
        width: newWidth,
        height: newHeight,
      })
    }, 0)
  }, [videoElement, isDimensionsSwitched, wrapperElement])

  // Update video size box on screen size change
  useEvent('resize', updateVideoSizeBox)

  useEffect(() => {
    // Update video size box for the first time mediaElement is available
    if (videoElement) {
      updateVideoSizeBox()
    }
  }, [videoElement, updateVideoSizeBox])

  useEffect(() => {
    // Hack 🧨
    // We need to wait 1 more tick here for React render on rotation
    // We could have used ResizeObserver to solve this problem but IE will require extra polyfill
    setTimeout(() => {
      updateVideoSizeBox()
    }, 0)
  }, [isDimensionsSwitched, updateVideoSizeBox])

  // Update video size box on media source change
  useEvent('loadedmetadata', updateVideoSizeBox, videoElement)

  return videoSizeBox
}
