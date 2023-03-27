import React, { useEffect, useRef } from "react";

import { _useMediaContext } from "../MediaContext";
import { clamp } from "../utils";

interface HijackedMediaElement extends HTMLMediaElement {
  paused: boolean;
  duration: number;
}

export type Direction = "forward" | "backward";

const hijackMediaElement = (
  mediaElement: HijackedMediaElement,
  {
    frequency,
    duration,
    direction,
  }: { frequency: number; duration: number; direction: Direction }
): {
  cleanup: () => void;
  updateDirection: (newDirection: Direction) => void;
} => {
  let _direction = direction;
  const mediaProperties = {
    paused: true,
    currentTime: 0,
    playbackRate: 1,
    duration,
  };

  // configurable value is required to override readonly value of media element
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
  Object.defineProperty(mediaElement, "paused", {
    configurable: true,
    get() {
      return mediaProperties.paused;
    },
    set(newValue: boolean) {
      mediaProperties.paused = newValue;
      const eventName = newValue ? "pause" : "play";

      mediaElement.dispatchEvent(new window.CustomEvent(eventName));
    },
  });

  Object.defineProperty(mediaElement, "duration", {
    configurable: true,
    get() {
      return mediaProperties.duration;
    },
    set(newValue: number) {
      mediaProperties.duration = newValue;
      mediaElement.dispatchEvent(new window.CustomEvent("durationchange"));

      if (mediaProperties.duration) {
        mediaElement.currentTime = 0;
      }
    },
  });

  Object.defineProperty(mediaElement, "currentTime", {
    configurable: true,
    get() {
      return mediaProperties.currentTime;
    },
    set(newValue: number) {
      const normalizedValue = clamp(
        newValue,
        0,
        mediaProperties.duration
      );
      mediaProperties.currentTime = normalizedValue;
      mediaElement.dispatchEvent(new window.CustomEvent("timeupdate"));

      // Prevent current time out of bound and dispatch ended event
      if (normalizedValue === mediaProperties.duration) {
        mediaElement.dispatchEvent(new window.CustomEvent("ended"));
        mediaElement.pause();
        return;
      }

      if (normalizedValue === 0) {
        mediaElement.pause();
      }
    },
  });

  // This is meant for custom playback without involving actual media elements
  // since browsers limit the playbackRate to certain levels
  // https://stackoverflow.com/questions/30970920/html5-video-what-is-the-maximum-playback-rate
  Object.defineProperty(mediaElement, "playbackRate", {
    configurable: true,
    get() {
      return mediaProperties.playbackRate;
    },
    set(newValue: number) {
      mediaProperties.playbackRate = newValue;
      mediaElement.dispatchEvent(new window.CustomEvent("ratechange"));
    },
  });

  let timerId: number;
  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId);
    }
  };

  Object.assign(mediaElement, {
    play: () => {
      if (mediaElement.currentTime === 0 && _direction === "backward") {
        mediaElement.currentTime = duration
      }

      if (duration === mediaElement.currentTime && _direction === "forward") {
        mediaElement.currentTime = 0;
      }

      timerId = window.setInterval(() => {
        const incrementedTime = (1 * mediaElement.playbackRate) / frequency;
        const factor = _direction === "forward" ? 1 : -1;
        mediaElement.currentTime += (incrementedTime * factor);
      }, 1000 / frequency);

      mediaElement.paused = false;
    },
    pause: () => {
      clearTimer();
      mediaElement.paused = true;
    },
  });

  return {
    cleanup: clearTimer,
    updateDirection(newDirection: Direction) {
      _direction = newDirection;
    },
  };
};

export interface PlayableProps {
  children?: React.ReactNode;
  frequency?: number;
  src?: string;
  direction?: Direction;
}

export const Playable = ({
  children,
  // Frequency default value to mimic browser's media behavior
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
  frequency = 4,
  src = "",
  direction = "forward",
}: PlayableProps) => {
  const {
    _mediaRef,
    _onDurationChange,
    _onLoadedMetadata,
    _onPause,
    _onPlay,
    _onRateChange,
    _onTimeUpdate,
    _onEmptied,
    _initialDuration,
    _applyInitialDuration,
  } = _useMediaContext();
  const hijackedMediaObj = useRef<ReturnType<typeof hijackMediaElement>>();

  // Hijack media element
  useEffect(() => {
    const mediaElement = _mediaRef.current;
    if (mediaElement && !hijackedMediaObj.current && _initialDuration) {
      hijackedMediaObj.current = hijackMediaElement(mediaElement, {
        frequency,
        duration: _initialDuration,
        direction,
      });
    }

    return () => {
      if (hijackedMediaObj.current) {
        hijackedMediaObj.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (hijackedMediaObj.current) {
      hijackedMediaObj.current.updateDirection(direction);
    }
  }, [direction]);

  useEffect(() => {
    const mediaElement = _mediaRef.current;
    if (mediaElement) {
      mediaElement.dispatchEvent(new window.CustomEvent("emptied"));
      (mediaElement as HijackedMediaElement).duration = _initialDuration;
      _applyInitialDuration();
      mediaElement.dispatchEvent(new window.CustomEvent("loadedmetadata"));
    }
  }, [src]);

  return (
    <audio
      hidden
      ref={_mediaRef}
      onEmptied={_onEmptied}
      onDurationChange={_onDurationChange}
      onLoadedMetadata={_onLoadedMetadata}
      onPause={_onPause}
      onPlay={_onPlay}
      onRateChange={_onRateChange}
      onTimeUpdate={_onTimeUpdate}
    >
      {children}
    </audio>
  );
};
