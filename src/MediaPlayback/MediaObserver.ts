import {
  DEFAULT_AUDIO_TRACK_ID,
  DEFAULT_AUTO_BITRATE_INDEX,
  DEFAULT_SUBTITLE_ID,
  MediaStatus,
} from "./constants";
import { MediaState } from "./types";

type Subscriber = () => void;

export const createMediaState = () => {
  let currentMediaState: MediaState = {
    currentTime: 0,
    duration: 0,
    ended: false,
    muted: false,
    paused: true,
    playbackRate: 1,
    rotate: 0,
    seeking: false,
    status: MediaStatus.LOADING,
    volume: 1,
    buffered: null,
    autoBitrateEnabled: true,
    bitrateInfos: [],
    currentBitrateIndex: DEFAULT_AUTO_BITRATE_INDEX,
    subtitleTracks: [],
    currentSubtitleTrackId: DEFAULT_SUBTITLE_ID,
    audioTracks: [],
    currentAudioTrackId: DEFAULT_AUDIO_TRACK_ID,
  };

  const listeners: Set<Subscriber> = new Set();

  return {
    subscribe: (subscriber: Subscriber) => {
      listeners.add(subscriber);
      return () => {
        listeners.delete(subscriber);
      };
    },
    update: (partialMediaState: Partial<MediaState>) => {
      currentMediaState = { ...currentMediaState, ...partialMediaState };

      for (let listener of listeners) {
        listener();
      }
    },
    getState() {
      return currentMediaState;
    },
  };
};
