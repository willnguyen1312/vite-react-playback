import React, { useContext } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { dequal as isEqual } from "dequal";

import { MediaContextType, MediaState, MediaContextProps } from "./types";

export const MediaContext = React.createContext<MediaContextType | null>(null);
const identity = (input: any) => {
  return input;
};

export const _useMediaContext = () => {
  const mediaContext = useContext(MediaContext);

  if (!mediaContext) {
    throw new Error("Please place the component inside MediaProvider");
  }

  return mediaContext;
};

export function useMediaContext(): {
  mediaState: MediaState;
} & MediaContextProps;
export function useMediaContext<TSelected extends Partial<MediaState>>(
  selector: (context: MediaState) => TSelected
): { mediaState: TSelected } & MediaContextProps;
export function useMediaContext(selector = identity): unknown {
  const {
    setPaused,
    setMuted,
    setCurrentTime,
    setPlaybackRate,
    setVolume,
    setRotate,
    setCurrentBitrateIndex,
    setCurrentSubtitleId,
    setCurrentAudioTrackId,
    _mediaState: { subscribe, getState },
  } = _useMediaContext();

  const mediaState = useSyncExternalStoreWithSelector(
    subscribe,
    getState,
    getState,
    selector,
    isEqual
  );

  return {
    mediaState,
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
