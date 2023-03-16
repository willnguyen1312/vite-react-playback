import React, { useContext, useEffect, useReducer, useRef } from "react";
import { dequal as isEqual } from "dequal";

import { MediaContextType, MediaState, MediaContextProps } from "./types";

export const MediaContext = React.createContext<MediaContextType | null>(null);
const identity = (input: any) => {
  return input;
}

export const _useMediaContext = () => {
  const mediaContext = useContext(MediaContext);

  if (!mediaContext) {
    throw new Error("Please place the component inside MediaProvider");
  }

  return mediaContext;
};

export function useMediaContext<TSelected = MediaState>(
  selector: (context: MediaState) => TSelected = identity
): { mediaState: TSelected } & MediaContextProps {
  const mediaContext = _useMediaContext();
  const [, forceUpdate] = useReducer((_state: number) => _state + 1, 0);
  const mediaStateRef = useRef(selector(mediaContext._mediaState.getState()));

  useEffect(() => {    
    const { unsubscribe } = mediaContext._mediaState.subscribe((state) => {
      
      const hasSelector = selector !== identity;
      const newState = selector(state);

      if (!hasSelector || !isEqual(newState, mediaStateRef.current)) {
        mediaStateRef.current = newState;
        forceUpdate();
      }
    });

    return unsubscribe;
  }, []);

  return {
    mediaState: mediaStateRef.current,

    setPaused: mediaContext.setPaused,
    setMuted: mediaContext.setMuted,
    setCurrentTime: mediaContext.setCurrentTime,
    setPlaybackRate: mediaContext.setPlaybackRate,
    setVolume: mediaContext.setVolume,
    setRotate: mediaContext.setRotate,
    setCurrentBitrateIndex: mediaContext.setCurrentBitrateIndex,
    setCurrentSubtitleId: mediaContext.setCurrentSubtitleId,
    setCurrentAudioTrackId: mediaContext.setCurrentAudioTrackId,
  };
}
