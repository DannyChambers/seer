import React, { useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

function FullScreenComponent({ zIndex, active, children }) {
  const handle = useFullScreenHandle();

  useEffect(() => {
    if (active) {
      handle.enter();
    }
  }, [active]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        zIndex: zIndex,
      }}
    >
      <FullScreen handle={handle}>{children}</FullScreen>
    </div>
  );
}

export default FullScreenComponent;
