import { proxy } from "valtio";
import {
  DEFAULT_AUDIO_TRACK_ID,
  DEFAULT_AUTO_BITRATE_INDEX,
  DEFAULT_SUBTITLE_ID,
  MediaStatus,
} from "./constants";

import { MediaState } from "./types";

export const createMediaState = () => {
  return proxy<MediaState>({
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
  });
};
