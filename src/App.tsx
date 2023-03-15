import { MediaProvider, useMediaContext } from "./MediaPlayback";
import { Video } from "./MediaPlayback/Video";
import React from "react";
import { Playable } from "./MediaPlayback/Playable";

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

function VideoPlayer() {
  return (
    <Video
      width="810"
      height="450"
      controls
      // src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    />
  );
}

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

function Rotation() {
  const { mediaState, setRotate } = useMediaContext();
  const rotateClockWise = () => setRotate(mediaState.rotate + 90);

  return (
    <div>
      <button
        onClick={() => {
          rotateClockWise();
        }}
      >
        Rotate 90deg
      </button>
      <p>Current rotation: {mediaState.rotate}</p>
    </div>
  );
}

function PlayableControl() {
  const { mediaState, setPaused } = useMediaContext();
  return (
    <button
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
        initialDuration={3000}
        initialTime={0}
        initialPlaybackRate={10}
      >
        <Playable src="aha" />
        <PlayableControl />
        {/* <div style={{ height: 500 }}>
          <VideoPlayer />
        </div> */}
        <CurrentTime />
        <Rotation />
        <Duration />
        <DisplayData />
      </MediaProvider>
    </main>
  );
}

export default App;
