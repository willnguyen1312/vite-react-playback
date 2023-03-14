import React from "react";
import { useSnapshot } from "valtio";

import { callAll } from "./utils";
import { MediaStatus } from "./constants";

export type MediaEventListener = (
  event: React.SyntheticEvent<HTMLMediaElement, Event>
) => void;

type MediaContextInternalEvents =
  | "onSeeking"
  | "onSeeked"
  | "onRateChange"
  | "onVolumeChange"
  | "onCanPlay"
  | "onWaiting"
  | "onPause"
  | "onPlay"
  | "onTimeUpdate"
  | "onProgress"
  | "onDurationChange"
  | "onError"
  | "onLoadedMetadata"
  | "onPlaying"
  | "onEmptied"
  | "onEnded";

export type MergedEventListeners = Record<
  MediaContextInternalEvents,
  ReturnType<typeof callAll>
>;

export interface BitrateInfo {
  bitrate: number;
  width: number;
  height: number;
  id: string;
}

export interface SubtitleTrack {
  id: number;
  lang: string;
}

export interface AudioTrack {
  id: number;
  lang: string;
  name: string;
}

export interface MediaState {
  // Streaming properties
  autoBitrateEnabled: boolean;
  bitrateInfos: BitrateInfo[];
  currentBitrateIndex: number;
  subtitleTracks: SubtitleTrack[];
  currentSubtitleTrackId: number;
  audioTracks: AudioTrack[];
  currentAudioTrackId: number;
  // Media element
  mediaElement: HTMLMediaElement | null;

  // Media properties
  currentTime: number;
  seeking: boolean;
  duration: number;
  volume: number;
  playbackRate: number;
  paused: boolean;
  muted: boolean;
  ended: boolean;
  buffered: TimeRanges | null;
  status: MediaStatus;
  rotate: number;
}

// Media context extends consumable props and includes internal properties
export type MediaContextType = {
  _applyInitialDuration: () => void;
  _initialDuration: number;
  _mediaRef: React.RefObject<HTMLMediaElement>;
  _startLoad: () => void;
  _stopLoad: () => void;
  _mediaState: MediaState;

  // Event Listeners
  _onLoadedMetadata: MediaEventListener;
  _onSeeking: MediaEventListener;
  _onSeeked: MediaEventListener;
  _onRateChange: MediaEventListener;
  _onVolumeChange: MediaEventListener;
  _onCanPlay: MediaEventListener;
  _onWaiting: MediaEventListener;
  _onPlaying: MediaEventListener;
  _onPause: MediaEventListener;
  _onPlay: MediaEventListener;
  _onTimeUpdate: MediaEventListener;
  _onProgress: MediaEventListener;
  _onDurationChange: MediaEventListener;
  _onError: MediaEventListener;
  _onEmptied: MediaEventListener;
  _onEnded: MediaEventListener;
} & MediaContextProps;

// Consumable props
export interface MediaContextProps {
  setCurrentTime: (currentTime: number) => void;
  setPlaybackRate: (playbackRate: number) => void;
  setVolume: (volume: number) => void;
  setPaused: (paused: boolean) => void;
  setMuted: (muted: boolean) => void;
  setRotate: (rotate: number) => void;
  setCurrentBitrateIndex: (currentBitrateIndex: number) => void;
  setCurrentSubtitleId: (subtitleId?: number) => void;
  setCurrentAudioTrackId: (audioTrackId?: number) => void;
}

export enum InitialBitrateSelection {
  HIGHEST = "HIGHEST",
  LOWEST = "LOWEST",
  AUTO = "AUTO",
}
