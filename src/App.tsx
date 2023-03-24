import { MediaProvider, useMediaContext } from "./MediaPlayback";
import React, { useState } from "react";
import { Direction, Playable } from "./MediaPlayback/Playable";
import { citiesData } from "./cities";

const cities = citiesData.map((item) => item.name);

const generateMockData = (duration: number) => {
  return Array.from({ length: duration }, () => {
    const randomIndex = Math.floor(Math.random() * cities.length);
    return cities[randomIndex];
  });
};

const mockedData = generateMockData(3000);

function CurrentTime() {
  const { mediaState } = useMediaContext();
  const { currentTime } = mediaState;
  return <h1>Current time: {currentTime}</h1>;
}

function Duration() {
  const { mediaState } = useMediaContext();
  return <h1>Duration: {mediaState.duration}</h1>;
}

function DisplayData() {
  const { mediaState } = useMediaContext();
  const displayData = mockedData
    .slice(0, Math.round(mediaState.currentTime))
    .join(" -> ");

  return <p>{displayData}</p>;
}

function PlayableControl() {
  const { mediaState, setPaused } = useMediaContext();
  const [direction, setDirection] = useState<Direction>("forward");

  return (
    <>
      <Playable src="aha" direction={direction} />
      <button
        // disabled={direction === "backward" && mediaState.currentTime === 0}
        onClick={() => {
          if (mediaState.paused) {
            setPaused(false);
          } else {
            setPaused(true);
          }
        }}
      >
        {mediaState.paused ? "Play" : "Pause"}
      </button>
      <button
        onClick={() => {
          if (direction === "forward") {
            setDirection("backward");
          } else {
            setDirection("forward");
          }
        }}
      >
        Direction: {direction === "forward" ? "forward" : "backward"}
      </button>
    </>
  );
}

function App() {
  const playerRef = React.useRef(null);
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MediaProvider
        initialDuration={100}
        initialTime={0}
        initialPlaybackRate={20}
      >
        <PlayableControl />
        <CurrentTime />
        <Duration />
        <DisplayData />
      </MediaProvider>
    </main>
  );
}

export default App;
