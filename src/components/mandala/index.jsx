import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Function to generate a random speed within a range
const getRandomSpeed = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Petal Component
const Petal = ({ petalData, angle, radius, layerRotation, zIndex }) => {
  const meshRef = useRef();

  useFrame(() => {
    const totalAngle = angle + layerRotation;
    meshRef.current.position.x = Math.cos(totalAngle) * radius;
    meshRef.current.position.y = Math.sin(totalAngle) * radius;
    meshRef.current.rotation.z = totalAngle;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={petalData.geometry}
      material={petalData.material}
    />
  );
};

// LayerRotator Component
const LayerRotator = ({ setLayerRotations, layerRotations }) => {
  useFrame(() => {
    setLayerRotations((rotations) =>
      rotations.map((rotationData, index) => ({
        ...rotationData,
        rotation:
          rotationData.rotation +
          rotationData.speed * (index % 2 === 0 ? 1 : -1),
      }))
    );
  });

  return null;
};

// Color range mappings
const colorRangeToHue = {
  reds: [0, 20],
  oranges: [20, 40],
  yellows: [40, 80],
  greens: [80, 140],
  blues: [200, 260],
  purples: [260, 290],
  pinks: [310, 350],
};

// Function to create a single layer of petals
const createLayer = (
  layerIndex,
  petalsPerLayer,
  initialSpacing,
  spacingIncrement,
  colorRange,
  saturation,
  lightness
) => {
  const maxLayerRadius = initialSpacing * layerIndex;
  const layerRotationOffset = Math.random() * Math.PI * 2;
  const hueRange = colorRangeToHue[colorRange];
  const hue = Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0];
  const color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);

  const shape = new THREE.Shape();
  shape.moveTo(Math.random() * 2, 0);
  shape.bezierCurveTo(
    Math.random() * 1.5,
    Math.random() * 0.5,
    Math.random() * 1,
    Math.random() * 0.5,
    Math.random() * 1.5,
    -Math.random() * 0.5,
    Math.random() * 2,
    0
  );

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });

  const petalData = { geometry, material };
  return Array.from({ length: petalsPerLayer }, (_, petalIndex) => {
    const angle =
      (petalIndex / petalsPerLayer) * Math.PI * 2 + layerRotationOffset;
    const radius = maxLayerRadius;
    return { petalData, angle, radius };
  });
};

// Mandala Component
const Mandala = ({
  numberOfLayers = 1,
  petalsPerLayer = 40,
  initialSpacing = 0.2,
  spacingIncrement = 0.02,
  colorRange = "blues", // Default color range
  saturation = 100, // Default saturation percentage
  lightness = 50, // Default lightness percentage
  zIndex = 0,
}) => {
  const [layers, setLayers] = useState([]);
  const [layerRotations, setLayerRotations] = useState(
    new Array(numberOfLayers).fill(0).map(() => ({
      rotation: 0,
      speed: getRandomSpeed(0.00001, 0.00101),
    }))
  );

  useEffect(() => {
    const layersData = [];
    for (let layerIndex = 0; layerIndex < numberOfLayers; layerIndex++) {
      const layer = createLayer(
        layerIndex,
        petalsPerLayer,
        initialSpacing,
        spacingIncrement,
        colorRange,
        saturation,
        lightness
      );
      layersData.push(layer);
    }

    setLayers(layersData.flat());
  }, [
    numberOfLayers,
    petalsPerLayer,
    initialSpacing,
    spacingIncrement,
    colorRange,
    saturation,

    lightness,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100vh",
        zIndex: zIndex,
      }}
      id="mandala"
    >
      <Canvas
        gl={{ alpha: true }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <LayerRotator
          setLayerRotations={setLayerRotations}
          layerRotations={layerRotations}
        />
        {layers.map(({ petalData, angle, radius }, index) => (
          <Petal
            key={index}
            petalData={petalData}
            angle={angle}
            radius={radius}
            layerRotation={
              layerRotations[Math.floor(index / petalsPerLayer)].rotation
            }
          />
        ))}
      </Canvas>
    </div>
  );
};

export default Mandala;
