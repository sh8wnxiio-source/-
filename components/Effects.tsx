import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Cloud } from '@react-three/drei';
import * as THREE from 'three';

interface EffectsProps {
  mode: 'single' | 'double' | 'none';
}

const RibbonConfetti = () => {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const y = (time * 0.5 + i * 0.1) % 5;
      dummy.position.set(
        Math.sin(i * 132.4) * 3,
        2.5 - y,
        Math.cos(i * 23.5) * 2 - 2 
      );
      dummy.rotation.set(time + i, time * 0.5, i);
      dummy.scale.setScalar(0.05);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.5, 0.2]} />
      <meshBasicMaterial color="#FF69B4" side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

const ChristmasSnow = () => {
    return (
        <Sparkles 
            count={200} 
            scale={6} 
            size={4} 
            speed={0.4} 
            opacity={0.8} 
            color="#FFD700"
        />
    )
}

const Effects: React.FC<EffectsProps> = ({ mode }) => {
  if (mode === 'single') {
    return (
      <group>
        <RibbonConfetti />
        <Cloud opacity={0.3} speed={0.4} width={5} depth={1.5} segments={10} position={[0, 2, -3]} />
      </group>
    );
  }

  if (mode === 'double') {
    return (
      <group>
        <ChristmasSnow />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Cloud opacity={0.3} speed={0.2} width={5} depth={1.5} segments={10} color="#d4af37" position={[0, 2, -3]} />
      </group>
    );
  }

  return null;
};

export default Effects;
