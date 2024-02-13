import React from "react";

interface NotSoGoodMediaPlayerProps {
  className?: string;
  controlBarClassName?: string;
  //   Business specific props
  policeDepartmentId?: string;
  policePartnerDepartmentId?: string;
  // 10+ more props
  showScrubber?: boolean;
  showVolume?: boolean;
  showPlaybackRate?: boolean;
  showFullscreen?: boolean;
}

function App() {
  return <NotSoGoodMediaPlayer />;
}

function NotSoGoodMediaPlayer(props: NotSoGoodMediaPlayerProps) {
  return null;
}
