import { MediaProvider, useMediaContext } from "./MediaPlayback";
import React, { useState } from "react";
import { Direction, Playable } from "./MediaPlayback/Playable";

const cities = [
  "East Susie",
  "Port Lailatown",
  "Port Cathy",
  "North Felipe",
  "Skilesburgh",
  "East Sunny",
  "New Jonatanshire",
  "Cincinnati",
  "Chynaville",
  "Gladyceberg",
  "Jaskolskiview",
  "Thousand Oaks",
  "North Myrlmouth",
  "West Macibury",
  "Hermanshire",
  "Muellertown",
  "Barryburgh",
  "New Ellis",
  "East Rowlandport",
  "Weissnatmouth",
];

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
        disabled={direction === "backward" && mediaState.paused}
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
        mediaSource="https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8"
        initialDuration={30000}
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
