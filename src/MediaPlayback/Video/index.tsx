import React, { useRef, useEffect } from "react";

import { _useMediaContext, useMediaContext } from "../MediaContext";
import { callAll, useMergeRefs } from "../utils";
import { MergedEventListeners } from "../types";

export interface VideoProps {
  /**
   * We don't need this prop anymore as
   * the Video component is able to scale itself to fit inside its wrapper
   * @deprecated
   */
  useCustomScale?: boolean;
}

export const Video = React.forwardRef<
  HTMLVideoElement,
  VideoProps &
    React.DetailedHTMLProps<
      React.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >
>(
  (
    {
      className,
      onCanPlay,
      onDurationChange,
      onError,
      onLoadedMetadata,
      onPause,
      onPlay,
      onProgress,
      onRateChange,
      onSeeked,
      onSeeking,
      onTimeUpdate,
      onVolumeChange,
      onWaiting,
      onPlaying,
      onEmptied,
      onEnded,
      children,
      style,
      ...rest
    },
    ref
  ) => {
    const {
      _mediaRef,
      _onCanPlay,
      _onDurationChange,
      _onError,
      _onLoadedMetadata,
      _onPause,
      _onPlay,
      _onProgress,
      _onRateChange,
      _onSeeked,
      _onSeeking,
      _onTimeUpdate,
      _onVolumeChange,
      _onWaiting,
      _onPlaying,
      _onEmptied,
      _onEnded,
      _applyInitialDuration,
    } = _useMediaContext();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const mergedEventListeners: MergedEventListeners = {
      onCanPlay: callAll(_onCanPlay, onCanPlay),
      onDurationChange: callAll(_onDurationChange, onDurationChange),
      onError: callAll(_onError, onError),
      onLoadedMetadata: callAll(_onLoadedMetadata, onLoadedMetadata),
      onPause: callAll(_onPause, onPause),
      onPlay: callAll(_onPlay, onPlay),
      onProgress: callAll(_onProgress, onProgress),
      onRateChange: callAll(_onRateChange, onRateChange),
      onSeeked: callAll(_onSeeked, onSeeked),
      onSeeking: callAll(_onSeeking, onSeeking),
      onTimeUpdate: callAll(_onTimeUpdate, onTimeUpdate),
      onVolumeChange: callAll(_onVolumeChange, onVolumeChange),
      onWaiting: callAll(_onWaiting, onWaiting),
      onPlaying: callAll(_onPlaying, onPlaying),
      onEmptied: callAll(_onEmptied, onEmptied),
      onEnded: callAll(_onEnded, onEnded),
    };

    useEffect(() => {
      _applyInitialDuration();
      // This is intentional as we only apply initialDuration on src change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rest.src]);

    return (
      <div ref={wrapperRef}>
        <video
          // Prevent mobile safari from going fullscreen on play by default
          playsInline
          style={{
            // transform: `rotate(${rotate}deg) scale(${scale})`,
            // width: videoSizeBox.width,
            // height: videoSizeBox.height,
            ...style,
          }}
          {...mergedEventListeners}
          {...rest}
          ref={useMergeRefs(ref, _mediaRef as React.Ref<HTMLVideoElement>)}
        >
          {children}
        </video>
      </div>
    );
  }
);

Video.displayName = `Video`;
