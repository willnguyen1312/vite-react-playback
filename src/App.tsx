import { MediaProvider, useMediaContext } from "./MediaPlayback";
import { Video } from "./MediaPlayback/Video";
import React, { useContext, useRef, useState } from "react";
import {
  Zoomable,
  zoomableContext,
  ZoomableContextType,
  ZoomableVideo,
} from "./Zoomable";

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
      >
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
      </MediaProvider>
    </main>
  );
}

export default App;
