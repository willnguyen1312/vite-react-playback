import { MediaProvider, useMediaContext } from "./MediaPlayback";
import { Video } from "./MediaPlayback/Video";
import React, { useContext, useRef, useState } from "react";
import { Playable } from "./MediaPlayback/Playable";
import {
  Zoomable,
  zoomableContext,
  ZoomableContextType,
  ZoomableVideo,
} from "./Zoomable";

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

// function VideoPlayer() {
//   return (
//     <Video
//       width="810"
//       height="450"
//       controls
//       // src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
//     />
//   );
// }

const VideoPlayer = () => {
  const { cropImage } = useContext(zoomableContext) as ZoomableContextType;
  const [imageData, serImageData] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const onClickHandler = () => {
    cropImage((imageData: string) => {
      serImageData(imageData);
    });
  };

  const downloadImage = () => {
    const link = document.createElement("a");

    link.setAttribute("href", imageData);
    link.setAttribute("download", "Cropped Image");
    link.click();
  };

  return (
    <div style={{ width: 810, height: 450, marginBottom: 150 }}>
      <ZoomableVideo
        render={({ onMediaReady }) => {
          return (
            <Video
              crossOrigin="anonymous"
              onLoadedMetadata={() => onMediaReady(videoRef)}
              // style={{
              //   height: "auto",
              //   width: "100%",
              // }}
              ref={videoRef}
              src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              controls
            />
          );
        }}
      ></ZoomableVideo>

      <button onClick={onClickHandler}>Crop Image</button>
      {imageData && (
        <>
          <section style={{ width: 500, height: 500 }}>
            <img
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={imageData}
            />
          </section>
          <button onClick={downloadImage}>Download Cropped Image</button>
        </>
      )}
    </div>
  );
};

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
      // mediaSource="https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8"
      // initialDuration={3000}
      // initialTime={10}
      // initialPlaybackRate={10}
      >
        {/* <Playable src="aha" /> */}
        <Zoomable
          enable
          maxZoom={4}
          moveStep={50}
          wheelZoomRatio={0.1}
          zoomStep={10}
        >
          <div style={{ marginBottom: 50 }}>
            <VideoPlayer />
          </div>
        </Zoomable>
        {/* <CurrentTime />
        <Rotation />
        <Duration />
        <DisplayData /> */}
      </MediaProvider>
    </main>
  );
}

export default App;
