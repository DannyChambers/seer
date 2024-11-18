import React, { useState, useEffect } from "react";
import MandalaArt from "./components/mandala";
import FullScreenComponent from "./components/fullscreen";
import ObjectDetection from "./components/object-detection";
import Eye from "./components/eye";
import Sound from "./components/sound";

function App() {
  const [userInteraction, setUserInteraction] = useState(false);
  const [auto, setAuto] = useState(true);
  const [target, setTarget] = useState([]);

  // useEffect(() => {
  //   console.log("target in app.jsx: ", target);
  // }, [target]);

  function iOS() {
    return (
      [
        "iPad Simulator",
        "iPhone Simulator",
        "iPod Simulator",
        "iPad",
        "iPhone",
        "iPod",
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  }

  return (
    <>
      <FullScreenComponent active={!iOS && userInteraction} zIndex={999999}>
        <MandalaArt
          numberOfLayers={24}
          colorRange="reds"
          saturation={1}
          lightness={10}
          // saturation={10}
          // lightness={15}
          zIndex={99}
        />
        <Eye
          zIndex={100}
          rotateGrid={false}
          {...(auto ? { autoLook: true } : {})}
          {...(!auto ? { gridIndex: target } : {})}
        />

        {!auto && <ObjectDetection onBoundingBoxUpdate={setTarget} />}

        <Sound
          source={[
            "/seer/sounds/1.wav",
            "/seer/sounds/2.wav",
            "/seer/sounds/3.wav",
            "/seer/sounds/4.wav",
          ]}
          simultaneous={6}
          interval={1000}
          loop={true}
          onInteract={setUserInteraction}
        />
      </FullScreenComponent>
    </>
  );
}

export default App;
