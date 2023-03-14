import { MediaProvider, useMediaContext } from "./MediaPlayback";
import { Video } from "./MediaPlayback/Video";
import React from "react";

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
  return <h1>Current time: {mediaState.currentTime}</h1>;
}

function Duration() {
  const { mediaState } = useMediaContext();
  return <h1>Duration: {mediaState.duration}</h1>;
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
      <MediaProvider mediaSource="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8">
        <VideoPlayer />
        <CurrentTime />
        <Duration />
      </MediaProvider>
    </main>
  );
}

export default App;
