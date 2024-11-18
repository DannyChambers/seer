// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import "@tensorflow/tfjs";

// function ObjectDetection({ zIndex = 0, onBoundingBoxUpdate }) {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [model, setModel] = useState(null);
//   const [dimensions, setDimensions] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });

//   const gridRows = 3; // Number of rows in the grid
//   const gridCols = 3; // Number of columns in the grid
//   const [highlightedGridIndex, setHighlightedGridIndex] = useState(-1);

//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     cocoSsd.load().then((loadedModel) => {
//       setModel(loadedModel);
//     });
//   }, []);

//   const runDetection = () => {
//     if (webcamRef.current && model) {
//       const video = webcamRef.current.video;
//       const scaleWidth = dimensions.width / video.videoWidth;
//       const scaleHeight = dimensions.height / video.videoHeight;
//       model.detect(video).then((predictions) => {
//         const peoplePredictions = predictions.filter(
//           (p) => p.class === "person"
//         );
//         highlightGrid(peoplePredictions, scaleWidth, scaleHeight);
//       });
//     }
//   };

//   const drawGrid = (ctx) => {
//     const gridWidth = dimensions.width / gridCols;
//     const gridHeight = dimensions.height / gridRows;
//     ctx.strokeStyle = "lightblue";

//     for (let i = 0; i < gridRows; i++) {
//       for (let j = 0; j < gridCols; j++) {
//         ctx.strokeRect(
//           dimensions.width - (j + 1) * gridWidth,
//           i * gridHeight,
//           gridWidth,
//           gridHeight
//         );
//       }
//     }
//   };

//   const highlightGrid = (predictions, scaleWidth, scaleHeight) => {
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//     ctx.save();
//     ctx.scale(-1, 1);
//     ctx.translate(-ctx.canvas.width, 0);

//     const gridWidth = dimensions.width / gridCols;
//     const gridHeight = dimensions.height / gridRows;

//     drawGrid(ctx);

//     predictions.forEach((prediction) => {
//       const [x, y, width, height] = prediction.bbox;
//       const scaledX = x * scaleWidth;
//       const scaledY = y * scaleHeight;
//       const scaledWidth = width * scaleWidth;
//       const scaledHeight = height * scaleHeight;

//       const centerX = scaledX + scaledWidth / 2;
//       const centerY = scaledY + 200; // Top Y coordinate

//       // Determine grid indices
//       const gridX = Math.floor(centerX / gridWidth);
//       const gridY = Math.floor(centerY / gridHeight);
//       const gridIndex = gridY * gridCols + gridX;

//       if (onBoundingBoxUpdate) {
//         onBoundingBoxUpdate(gridIndex);
//       }

//       // Check if the gridIndex is different from the highlightedGridIndex
//       if (gridIndex !== highlightedGridIndex) {
//         // Clear the previous red highlight
//         ctx.clearRect(
//           dimensions.width - (highlightedGridIndex % gridCols) * gridWidth,
//           Math.floor(highlightedGridIndex / gridCols) * gridHeight,
//           gridWidth,
//           gridHeight
//         );

//         // Highlight the new grid cell in red
//         ctx.strokeStyle = "red";
//         ctx.lineWidth = 2;
//         ctx.strokeRect(
//           dimensions.width - (gridX + 1) * gridWidth,
//           gridY * gridHeight,
//           gridWidth,
//           gridHeight
//         );

//         setHighlightedGridIndex(gridIndex);
//       }
//     });

//     ctx.restore();
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       runDetection();
//     }, 100);
//     return () => clearInterval(interval);
//   }, [model, dimensions]);

//   return (
//     <div>
//       <Webcam
//         ref={webcamRef}
//         style={{
//           position: "absolute",
//           zIndex: zIndex,
//           transform: "scaleX(-1)",
//           opacity: "0",
//         }}
//         width={dimensions.width}
//         height={dimensions.height}
//       />
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           zIndex: zIndex + 1,
//           transform: "scaleX(-1)",
//           opacity: "0",
//         }}
//         width={dimensions.width}
//         height={dimensions.height}
//       />
//     </div>
//   );
// }

// export default ObjectDetection;

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

function ObjectDetection({ zIndex = 0, onBoundingBoxUpdate }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const gridRows = 3;
  const gridCols = 3;
  const [highlightedGridIndex, setHighlightedGridIndex] = useState(-1);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
    });
  }, []);

  const runDetection = () => {
    if (webcamRef.current && model) {
      const video = webcamRef.current.video;
      if (video.readyState === 4) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set video width and height
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        const scaleWidth = dimensions.width / videoWidth;
        const scaleHeight = dimensions.height / videoHeight;

        model.detect(video).then((predictions) => {
          const peoplePredictions = predictions.filter(
            (p) => p.class === "person"
          );
          highlightGrid(peoplePredictions, scaleWidth, scaleHeight);
        });
      }
    }
  };

  const drawGrid = (ctx) => {
    const gridWidth = dimensions.width / gridCols;
    const gridHeight = dimensions.height / gridRows;
    ctx.strokeStyle = "lightblue";

    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        ctx.strokeRect(
          dimensions.width - (j + 1) * gridWidth,
          i * gridHeight,
          gridWidth,
          gridHeight
        );
      }
    }
  };

  const highlightGrid = (predictions, scaleWidth, scaleHeight) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-ctx.canvas.width, 0);

    const gridWidth = dimensions.width / gridCols;
    const gridHeight = dimensions.height / gridRows;

    drawGrid(ctx);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      const scaledX = x * scaleWidth;
      const scaledY = y * scaleHeight;
      const scaledWidth = width * scaleWidth;
      const scaledHeight = height * scaleHeight;

      const centerX = scaledX + scaledWidth / 2;
      const centerY = scaledY + scaledHeight / 2; // Central Y coordinate

      // Determine grid indices
      const gridX = Math.floor(centerX / gridWidth);
      const gridY = Math.floor(centerY / gridHeight);
      const gridIndex = gridY * gridCols + gridX;

      if (onBoundingBoxUpdate) {
        onBoundingBoxUpdate(gridIndex);
      }

      // Check if the gridIndex is different from the highlightedGridIndex
      if (gridIndex !== highlightedGridIndex) {
        // Clear the previous red highlight
        ctx.clearRect(
          dimensions.width - (highlightedGridIndex % gridCols) * gridWidth,
          Math.floor(highlightedGridIndex / gridCols) * gridHeight,
          gridWidth,
          gridHeight
        );

        // Highlight the new grid cell in red
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          dimensions.width - (gridX + 1) * gridWidth,
          gridY * gridHeight,
          gridWidth,
          gridHeight
        );

        setHighlightedGridIndex(gridIndex);
      }
    });

    ctx.restore();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      runDetection();
    }, 500);
    return () => clearInterval(interval);
  }, [model, dimensions]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          zIndex: zIndex,
          transform: "scaleX(-1)",
          opacity: "0",
        }}
        width={dimensions.width}
        height={dimensions.height}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          zIndex: zIndex + 1,
          transform: "scaleX(-1)",
          opacity: "0",
        }}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}

export default ObjectDetection;
