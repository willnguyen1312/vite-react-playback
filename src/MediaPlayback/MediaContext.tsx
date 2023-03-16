import React, { useContext } from "react";

import { MediaContextType, MediaContextProps, MediaState } from "./types";

export const MediaContext = React.createContext<MediaContextType | null>(null);

export const _useMediaContext = () => {
  const mediaContext = useContext(MediaContext);

  if (!mediaContext) {
    throw new Error("Please place the component inside MediaProvider");
  }

  return mediaContext;
};

export function useMediaContext(): MediaContextProps & {
  mediaState: MediaState;
} {
  const {
    _mediaState,
    setCurrentAudioTrackId,
    setCurrentBitrateIndex,
    setCurrentSubtitleId,
    setCurrentTime,
    setMuted,
    setPaused,
    setPlaybackRate,
    setRotate,
    setVolume,
  } = _useMediaContext();

  return {
    mediaState: _mediaState,
    setPaused,
    setMuted,
    setCurrentTime,
    setPlaybackRate,
    setVolume,
    setRotate,
    setCurrentBitrateIndex,
    setCurrentSubtitleId,
    setCurrentAudioTrackId,
  };
}
