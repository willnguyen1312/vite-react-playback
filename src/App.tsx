import { MediaProvider, useMediaContext } from "./MediaPlayback";
import { Video } from "./MediaPlayback/Video";
import React from "react";

function VideoPlayer() {
  return <Video width="810" height="450" controls />;
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

function Static() {
  return <h2>I'm static. No need to re-render me 🥹</h2>;
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
      <MediaProvider mediaSource="https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8">
        <div style={{ height: 500, background: "black" }}>
          <VideoPlayer />
        </div>
        <CurrentTime />
        <Rotation />
        <Duration />
        <Static />
      </MediaProvider>
    </main>
  );
}

export default App;
