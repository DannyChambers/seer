import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const lookAtDirections = [
  new THREE.Vector3(0.2, 0.2, 1), // Top Right
  new THREE.Vector3(0, 0.2, 1), // Top Center
  new THREE.Vector3(-0.2, 0.2, 1), // Top Left
  new THREE.Vector3(0.2, 0, 1), // Middle Right
  new THREE.Vector3(0, 0, 1), // Center
  new THREE.Vector3(-0.2, 0, 1), // Middle Left
  new THREE.Vector3(0.2, -0.2, 1), // Bottom Right
  new THREE.Vector3(0, -0.2, 1), // Bottom Center
  new THREE.Vector3(-0.2, -0.2, 1), // Bottom Left
];

const EyeModelRenderer = ({ gridIndex, rotateGrid }) => {
  const [isModelReady, setIsModelReady] = useState(false);
  const eyeModelRef = useRef();
  const { scene: eyeModel } = useLoader(GLTFLoader, "/seer/images/eye/Eye.glb");

  useEffect(() => {
    if (eyeModel) {
      const eyeballMesh = eyeModel;
      eyeModelRef.current = eyeballMesh;
      setIsModelReady(true);
    }
  }, [eyeModel]);

  useFrame(() => {
    if (eyeModelRef.current && lookAtDirections[gridIndex]) {
      let direction = lookAtDirections[gridIndex].clone();

      if (rotateGrid) {
        direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
      }

      direction.add(eyeModelRef.current.position);
      eyeModelRef.current.lookAt(direction);
    }
  });

  return (
    <Suspense fallback={<span>Loading...</span>}>
      {isModelReady && (
        <primitive
          object={eyeModelRef.current}
          position={[0, 0, 0]}
          scale={[0.7, 0.7, 0.7]}
        />
      )}
    </Suspense>
  );
};

function Eye({ zIndex, rotateGrid, autoLook }) {
  const [gridIndex, setGridIndex] = useState(4); // Initially set to Center
  const intervalRef = useRef(null);

  const getRandomGridIndex = () => {
    return Math.floor(Math.random() * lookAtDirections.length);
  };

  const setupAutoLook = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start generating random gridIndex immediately
    intervalRef.current = setInterval(() => {
      setGridIndex(getRandomGridIndex());
    }, Math.random() * (2000 - 500) + 500);
  };

  useEffect(() => {
    if (autoLook) {
      setupAutoLook();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoLook]);

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
    >
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight intensity={1} position={[50, 50, 1]} />
        <directionalLight intensity={1} position={[0, 50, 1]} />
        <EyeModelRenderer gridIndex={gridIndex} rotateGrid={rotateGrid} />
      </Canvas>
    </div>
  );
}

export default Eye;
