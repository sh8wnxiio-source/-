import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { HandData, HandGesture } from '../types';
import PonyModel from './PonyModel';
import Effects from './Effects';

interface ARSceneProps {
  hands: HandData[];
}

const HandContainer: React.FC<{ hand: HandData, isChristmas: boolean }> = ({ hand, isChristmas }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Euler());
  const targetScale = useRef(1);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth interpolation
    const lerpFactor = 0.1; // 10% per frame for smoothness

    // Update targets
    targetPos.current.copy(hand.position);
    targetRot.current.setFromVector3(hand.rotation);
    targetScale.current = hand.scale;

    // Apply Lerp
    groupRef.current.position.lerp(targetPos.current, lerpFactor);
    // Quaternion slerp is better for rotation but simple Euler lerp is ok for small movements
    groupRef.current.rotation.x += (targetRot.current.x - groupRef.current.rotation.x) * lerpFactor;
    groupRef.current.rotation.y += (targetRot.current.y - groupRef.current.rotation.y) * lerpFactor;
    groupRef.current.rotation.z += (targetRot.current.z - groupRef.current.rotation.z) * lerpFactor;

    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale.current - currentScale) * lerpFactor;
    groupRef.current.scale.setScalar(newScale);
  });

  return (
    <group ref={groupRef}>
      {hand.gesture === HandGesture.OPEN_PALM && (
        <PonyModel isChristmas={isChristmas} />
      )}
    </group>
  );
};

const ARScene: React.FC<ARSceneProps> = ({ hands }) => {
  // Determine mode based on visible open hands
  const openHandsCount = hands.filter(h => h.gesture === HandGesture.OPEN_PALM).length;
  const isChristmasMode = openHandsCount >= 2;

  const effectMode = isChristmasMode ? 'double' : (openHandsCount === 1 ? 'single' : 'none');

  return (
    <Canvas className="absolute top-0 left-0 w-full h-full z-10" gl={{ alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FFF8DC" />
      
      {/* Environment map for shiny leather effect */}
      <Environment preset="sunset" />

      <Effects mode={effectMode} />

      {hands.map((hand) => (
        <HandContainer 
          key={hand.id} 
          hand={hand} 
          isChristmas={isChristmasMode} 
        />
      ))}
    </Canvas>
  );
};

export default ARScene;