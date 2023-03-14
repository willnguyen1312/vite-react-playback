import React, { useEffect, useRef } from "react";
import Hls from 'hls.js'

import { clamp, uniqueId } from "./utils";
import { MediaContext } from "./MediaContext";
import {
  DEFAULT_AUDIO_TRACK_ID,
  DEFAULT_AUTO_BITRATE_INDEX,
  DEFAULT_SUBTITLE_ID,
  MediaStatus,
} from "./constants";
import { createMediaState } from "./mediaState";
import {
  AudioTrack,
  BitrateInfo,
  InitialBitrateSelection,
  SubtitleTrack,
} from "./types";

export interface MediaProviderProps {
  initialDuration?: number;
  mediaSource?: string;
  initialTime?: number;
  initialPlaybackRate?: number;
  initialBitrateSelection?: InitialBitrateSelection;
  children: React.ReactNode;
}

export function MediaProvider({
  children,
  mediaSource,
  initialTime = 0,
  initialBitrateSelection = InitialBitrateSelection.AUTO,
  initialDuration = 0,
  initialPlaybackRate = 1,
}: MediaProviderProps) {
  // Refs
  const _playPromise = useRef<Promise<void>>();
  const _pausedRef = useRef<boolean>(true);
  const _hlsRef = useRef<Hls>();
  const _mediaRef = useRef<HTMLMediaElement>(null);
  const _timeoutLoadingId = useRef<number>();
  const _doneSetInitialTime = useRef<boolean>(initialTime === 0);
  const _doneLoadedMetadata = useRef<boolean>(false);
  const _mediaStateRef = useRef(createMediaState());

  const _getMedia = (): HTMLMediaElement => {
    if (_mediaRef.current) {
      return _mediaRef.current;
    }

    throw new Error("Media element is not available");
  };

  const _getHls = () => {
    const hls = _hlsRef.current;
    if (!hls) {
      throw new Error("HLS instance is not available");
    }
    return hls;
  };

  const releaseHlsResource = () => {
    const hls = _hlsRef.current;
    if (hls) {
      hls.destroy();
    }

    const media = _mediaRef.current;
    if (media) {
      // There is edge case where React reuses component in render process given the identical tags
      // For instance: Audio and Video players can reference the same MediaProvider component while actually render two different items
      // React will reuse the previously rendered component instead of creating a new one
      // Hence, we need to manually dispatch emptied event here because it's actually emptied from browsers' perspective
      media.dispatchEvent(new window.CustomEvent("emptied"));
    }
  };

  const setLoadingStatus = () => {
    const timeoutId = _timeoutLoadingId.current;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Avoid showing loading indicator early on fast stream which can be annoying to user
    // Similar to Youtube's experience
    _timeoutLoadingId.current = setTimeout(() => {
      _mediaStateRef.current.status = MediaStatus.LOADING;
    }, 1000);
  };

  const setCanPlayStatus = () => {
    const timeoutId = _timeoutLoadingId.current;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    _mediaStateRef.current.status = MediaStatus.CAN_PLAY;
  };

  const setPlaybackRate = (playbackRate: number) => {
    const mediaElement = _getMedia();
    mediaElement.playbackRate = playbackRate;
  };

  const setCurrentTime = (currentTime: number) => {
    const media = _getMedia();
    // In case media's duration is not available, we fall back to duration from state for early seeking if available
    const normalizedDuration = Number.isFinite(media.duration)
      ? media.duration
      : _mediaStateRef.current.duration;
    const newCurrentTime = clamp(currentTime, 0, normalizedDuration);

    if (newCurrentTime !== media.currentTime) {
      media.currentTime = newCurrentTime;
    }

    if (!_doneLoadedMetadata.current) {
      // Media element won't dispatch timeupdate event until it's ready for playing - loadedmetadata event
      // We need to manually do it here for early seeking
      media.dispatchEvent(new window.CustomEvent("timeupdate"));
    }
  };

  const _applyInitialDuration = () => {
    _mediaStateRef.current.duration = initialDuration;
    _applyInitialTime(initialDuration);
  }

  const _applyInitialTime = (duration: number) => {
    // We only want to seek ahead of time when duration is available
    if (!_doneSetInitialTime.current && duration > 0) {
      _doneSetInitialTime.current = true;
      setCurrentTime(initialTime);
    }
  };

  useEffect(() => {
    if (!mediaSource) {
      return;
    }

    _mediaStateRef.current.rotate = 0;
    _mediaStateRef.current.autoBitrateEnabled = true;
    // Initial status is LOADING, this is meaningful on stream change
    // as we want to display a loading indicator again until media data is available
    setLoadingStatus();
    const media = _getMedia();

    const initHls = async () => {
      const autoStartLoad =
        initialBitrateSelection === InitialBitrateSelection.AUTO;

      if (Hls.isSupported()) {
        const newHls = new Hls({ autoStartLoad, enableWorker: false, });
        _hlsRef.current = newHls;
        newHls.attachMedia(media as HTMLVideoElement);
        newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
          newHls.loadSource(mediaSource);
        });

        newHls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const bitrateInfos: BitrateInfo[] = data.levels.map((level) => {
            return {
              bitrate: level.bitrate,
              // Some video and audio streams don't come with width and height
              height: level.height || 0,
              width: level.width || 0,
              id: uniqueId(),
            };
          });

          if (!autoStartLoad) {
            const sortedBitrateInfos = bitrateInfos.sort(
              (aBitrate, bBitrate) => aBitrate.height - bBitrate.height
            );
            const handlers = {
              [InitialBitrateSelection.HIGHEST]: () =>
                (newHls.currentLevel = sortedBitrateInfos.length - 1),
              [InitialBitrateSelection.LOWEST]: () => (newHls.currentLevel = 0),
            };

            const handler = handlers[initialBitrateSelection];
            handler && handler();
            newHls.startLoad();
          }

          _mediaStateRef.current.bitrateInfos = bitrateInfos;
          _mediaStateRef.current.subtitleTracks = [];
        });

        newHls.on(Hls.Events.LEVEL_SWITCHING, (_, { level }) => {
          const { buffered } = _getMedia();
          setLoadingStatus();
          _mediaStateRef.current.currentBitrateIndex = level;
          _mediaStateRef.current.buffered = buffered;
        });

        newHls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
          const subtitleTracks: SubtitleTrack[] =
            data.subtitleTracks.map<SubtitleTrack>((track) => ({
              id: track.id,
              lang: track.lang || "",
            }));
          _mediaStateRef.current.subtitleTracks = subtitleTracks;
        });

        newHls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
          _mediaStateRef.current.currentAudioTrackId = data.id;
        });

        newHls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
          const audioTracks: AudioTrack[] = data.audioTracks.map<AudioTrack>(
            (track) => ({
              id: track.id,
              lang: track.lang || "",
              name: track.name,
            })
          );
          _mediaStateRef.current.audioTracks = audioTracks;
        });

        newHls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
          _mediaStateRef.current.currentAudioTrackId = data.id;
        });

        newHls.on(Hls.Events.FRAG_BUFFERED, setCanPlayStatus);

        // https://github.com/video-dev/hls.js/blob/master/docs/API.md#fifth-step-error-handling
        // Hls.js code for error handling
        newHls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                newHls.startLoad();
                _mediaStateRef.current.status = MediaStatus.RECOVERING;
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                // try to recover media error
                newHls.recoverMediaError();
                _mediaStateRef.current.status = MediaStatus.RECOVERING;
                break;
              default:
                // cannot recover
                newHls.destroy();
                _mediaStateRef.current.status = MediaStatus.ERROR;
                break;
            }
          } else {
            switch (data.details) {
              // HLS will try to load the next segment when encounter this error
              // so we can safely consume it as loading state
              case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
                setLoadingStatus();
                break;
            }
          }
        });
      } else if (media && media.canPlayType("application/vnd.apple.mpegurl")) {
        // For native support like Apple's mobile safari
        media.src = mediaSource;
      }
    };

    initHls();

    return releaseHlsResource;
  }, [mediaSource]);

  useEffect(() => {
    _applyInitialDuration()
  }, [mediaSource]);

  const checkMediaHasDataToPlay = () => {
    const { buffered, currentTime } = _getMedia();

    for (let index = 0; index < buffered.length; index++) {
      // In rare cases, Firefox and Safari start time is different than 0 (i.e: 0.5614)
      // In some cases, media current time is smaller than start of a timeRange such as 7.85 < 8.256 but media is still playable
      // This is a hack as our streaming service has not worked on normalizing stream data
      // This leads to falsy check as buffered values are very odd values like 0.00123
      // We use offset 1 second on start of timeRange here to determine whether media has data to play at current time
      // This avoid showing loading icon while video is still playable
      const [currentTimerangeStart, currentTimerangeEnd] = [
        buffered.start(index),
        buffered.end(index),
      ];
      if (
        currentTime + 1 >= currentTimerangeStart &&
        currentTime <= currentTimerangeEnd
      ) {
        return true;
      }
    }

    return false;
  };

  const _onLoadedMetadata = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    _doneLoadedMetadata.current = true;
    const mediaElement = event.currentTarget;

    _applyInitialTime(mediaElement.duration);
    setPlaybackRate(initialPlaybackRate);

    _mediaStateRef.current.mediaElement = mediaElement;
    _mediaStateRef.current.duration = mediaElement.duration;
    if (!_pausedRef.current) {
      mediaElement.play();
    }
  };

  const _onSeeking = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const { currentTime, ended, seeking } = event.currentTarget;
    _mediaStateRef.current.currentTime = currentTime;
    _mediaStateRef.current.ended = ended;
    _mediaStateRef.current.seeking = seeking;
    if (!checkMediaHasDataToPlay()) {
      setLoadingStatus();
    }
  };

  const _onSeeked = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    setCanPlayStatus();
    _mediaStateRef.current.seeking = event.currentTarget.seeking;
  };

  const _onRateChange = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    _mediaStateRef.current.playbackRate = event.currentTarget.playbackRate;
  };

  const _onVolumeChange = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    const { muted, volume } = event.currentTarget;
    _mediaStateRef.current.muted = muted;
    _mediaStateRef.current.volume = volume;
  };

  const _onPause = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const { paused, ended } = event.currentTarget;
    _pausedRef.current = paused;
    _mediaStateRef.current.paused = paused;
    _mediaStateRef.current.ended = ended;
  };

  const _onPlay = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const { paused, ended } = event.currentTarget;
    _pausedRef.current = paused;
    _mediaStateRef.current.paused = paused;
    _mediaStateRef.current.ended = ended;
  };

  const _onProgress = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    const { buffered } = event.currentTarget;
    // There are cases when loaded buffer does not include necessary data to play at current time
    // Thus, we need to double-check here
    if (checkMediaHasDataToPlay()) {
      setCanPlayStatus();
    }
    _mediaStateRef.current.buffered = buffered;
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event
  // The name is misleading as the event still gets fired when data is available for playing
  const _onWaiting = () => {
    if (!checkMediaHasDataToPlay()) {
      setLoadingStatus();
    }
  };

  const _onTimeUpdate = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    if (_doneSetInitialTime.current) {
      _mediaStateRef.current.currentTime = event.currentTarget.currentTime;
    }
  };

  const _onDurationChange = (
    event: React.SyntheticEvent<HTMLMediaElement, Event>
  ) => {
    const duration = event.currentTarget.duration;
    // Handle Infinity value occasionally on Safari
    if (Number.isFinite(duration)) {
      _mediaStateRef.current.duration = duration;
    }
  };

  const _onError = () => {
    _mediaStateRef.current.status = MediaStatus.ERROR;
  };

  const _onEnded = () => {
    _mediaStateRef.current.ended = true;
  };

  const _onEmptied = () => {
    const { buffered, currentTime } = _getMedia();
    _doneLoadedMetadata.current = false;
    _doneSetInitialTime.current = false;

    setLoadingStatus();
    // We need to reset this value to update scrubber's indicator
    _mediaStateRef.current.buffered = buffered;
    _mediaStateRef.current.currentTime = currentTime;
  };

  const setVolume = (volume: number) => {
    // Browsers only allow 0 to 1 volume value
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
    const newVolume = clamp(volume, 0, 1);
    _getMedia().volume = newVolume;
  };

  const setMuted = (muted: boolean) => {
    _getMedia().muted = muted;
  };

  // We need this special handler to handle play/pause methods across browsers
  // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  const setPaused = async (paused: boolean) => {
    const media = _getMedia();
    // We need to store the latest paused state in ref for later access
    _pausedRef.current = paused;
    // Update UI
    _mediaStateRef.current.paused = paused;

    if (paused) {
      const playPromise = _playPromise.current;
      if (playPromise) {
        await playPromise;

        _playPromise.current = undefined;
        // Check the latest paused state
        if (_pausedRef.current) {
          media.pause();
        }
      } else {
        // IE doesn't return promise, we can just hit pause method
        media.pause();
      }
    } else {
      // Modern browser return a promise, undefined in IE
      _playPromise.current = media.play();
    }
  };

  const setCurrentBitrateIndex = (
    bitrateIndex = DEFAULT_AUTO_BITRATE_INDEX
  ) => {
    const autoBitrateEnabled = bitrateIndex === DEFAULT_AUTO_BITRATE_INDEX;
    _mediaStateRef.current.autoBitrateEnabled = autoBitrateEnabled;
    if (!autoBitrateEnabled) {
      _mediaStateRef.current.currentBitrateIndex = bitrateIndex;
    }
    const hlsInstance = _getHls();
    if (hlsInstance.currentLevel !== bitrateIndex) {
      hlsInstance.currentLevel = bitrateIndex;
    }
  };

  const setCurrentSubtitleId = (subtitleId = DEFAULT_SUBTITLE_ID) => {
    const hlsInstance = _getHls();
    if (hlsInstance.subtitleTrack !== subtitleId) {
      hlsInstance.subtitleTrack = subtitleId;
    }
  };

  const setCurrentAudioTrackId = (audioTrackId = DEFAULT_AUDIO_TRACK_ID) => {
    const hlsInstance = _getHls();
    if (hlsInstance.audioTrack !== audioTrackId) {
      hlsInstance.audioTrack = audioTrackId;
    }
  };

  const setRotate = (rotate: number) =>
    (_mediaStateRef.current.rotate = rotate % 360);

  // These methods might be called by both MSE and none-MSE players
  // That's why we don't use _getHls helper to avoid error thrown on none-MSE players
  const _startLoad = () => _hlsRef.current?.startLoad();

  const _stopLoad = () => _hlsRef.current?.stopLoad();



  return (
    <MediaContext.Provider
      value={{
        _initialDuration: initialDuration,
        _applyInitialDuration,
        setCurrentBitrateIndex,
        setCurrentSubtitleId,
        setCurrentAudioTrackId,

        // Stream methods
        _startLoad,
        _stopLoad,

        // Media methods
        setCurrentTime,
        setPlaybackRate,
        setVolume,
        setMuted,
        setPaused,
        setRotate,

        _mediaRef,
        _mediaState: _mediaStateRef.current,

        // Internal event handlers - we use these to hook into media's events
        _onLoadedMetadata,
        _onSeeking,
        _onSeeked,
        _onRateChange,
        _onVolumeChange,
        _onCanPlay: setCanPlayStatus,
        _onWaiting,
        _onPlaying: setCanPlayStatus,
        _onPause,
        _onPlay,
        _onTimeUpdate,
        _onProgress,
        _onDurationChange,
        _onError,
        _onEmptied,
        _onEnded,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}
