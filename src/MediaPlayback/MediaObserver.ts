import {
  DEFAULT_AUDIO_TRACK_ID,
  DEFAULT_AUTO_BITRATE_INDEX,
  DEFAULT_SUBTITLE_ID,
  MediaStatus,
} from "./constants";
import { MediaState } from "./types";

type Subscriber = (mediaState: MediaState) => void;

export const createMediaState = () => {
  const currentMediaState: MediaState = {
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

  const subscribers: Set<Subscriber> = new Set();

  return {
    subscribe: (subscriber: Subscriber) => {
      subscribers.add(subscriber);
      return {
        unsubscribe: () => {
          subscribers.delete(subscriber);
        },
      };
    },
    update: (partialMediaState: Partial<MediaState>) => {
      Object.assign(currentMediaState, partialMediaState);
      subscribers.forEach((subscriber) => subscriber(currentMediaState));
    },
    getState: () => currentMediaState,
  };
};
