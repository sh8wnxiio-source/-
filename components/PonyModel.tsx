import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, RoundedBox, Cone, Sparkles } from '@react-three/drei';
import { HERMES_ORANGE, LEATHER_BROWN } from '../constants';

interface PonyModelProps {
  isChristmas?: boolean;
}

const PonyModel: React.FC<PonyModelProps> = ({ isChristmas = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [spawned, setSpawned] = useState(false);
  
  // Animation state for "Pop" effect
  const currentScale = useRef(0);
  const targetScale = 0.8; // Final scale of the pony

  // Idle Animation & Spawn Animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Spawn "Pop" Animation (Elastic-ish)
    if (currentScale.current < targetScale) {
        // Simple spring-like lerp
        const speed = 5;
        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale + 0.1, speed * delta);
        if(currentScale.current > targetScale) {
            currentScale.current = targetScale; // Snap to finish
            setSpawned(true);
        }
    }

    // 2. Idle Animation (Bobbing and Breathing)
    // Gentle floating
    const floatY = -0.5 + Math.sin(t * 2) * 0.05;
    groupRef.current.position.y = floatY;
    
    // Swaying (Rotation around Z slightly)
    groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;

    // Apply scale (Idle breathing + Spawn scale)
    const breath = 1 + Math.sin(t * 3) * 0.02;
    const finalScale = currentScale.current * breath;
    groupRef.current.scale.set(finalScale, finalScale, finalScale);
  });

  // --- Configuration ---
  const primaryColor = isChristmas ? '#FFFFFF' : HERMES_ORANGE; 
  const secondaryColor = isChristmas ? '#D42426' : LEATHER_BROWN; 
  const saddleColor = isChristmas ? '#D42426' : '#FFD700'; 
  const snoutColor = '#FFE4C4'; 

  // Fluffy / Felt Material Props
  // High roughness + Sheen simulates wool/felt/plush fabric
  const materialProps = {
    roughness: 1.0,         // No plastic reflection, looks like fabric
    metalness: 0.0,
    sheen: 1.0,             // Velvet-like sheen
    sheenColor: new THREE.Color(isChristmas ? '#FFFACD' : '#FFDAB9'), // Warm sheen
    clearcoat: 0.0,         // No clear coat for wool
  };

  const maneMaterialProps = {
    color: secondaryColor,
    roughness: 1.0,
    sheen: 0.5,
  };

  return (
    <group 
        ref={groupRef} 
        position={[0, -0.5, 0]} 
        // Rotation: 0,0,0 means side view (Pony built along X axis).
        // Added slight Y rotation (Math.PI/12) to give a bit of 3D depth while keeping side profile.
        rotation={[0, Math.PI / 12, 0]} 
    >
      
      {/* Celebration Effect */}
      <Sparkles 
        count={50} 
        scale={3} 
        size={4} 
        speed={0.4} 
        opacity={1} 
        color={isChristmas ? "#00FF00" : "#FFD700"} 
        position={[0, 1, 0]}
      />

      {/* --- BODY (Chubby Shetland) --- */}
      <RoundedBox args={[1.5, 1.2, 1.1]} radius={0.5} position={[0, 0, 0]}>
        <meshStandardMaterial color={primaryColor} {...materialProps} />
      </RoundedBox>

      {/* --- HEAD GROUP --- */}
      <group position={[-0.9, 0.8, 0]}>
        {/* Head Base */}
        <Sphere args={[0.7, 32, 32]}>
          <meshStandardMaterial color={primaryColor} {...materialProps} />
        </Sphere>
        
        {/* Snout */}
        <group position={[-0.4, -0.15, 0]} rotation={[0, 0, 0.1]}>
           <Sphere args={[0.38, 32, 32]} scale={[1, 0.85, 1]}>
             <meshStandardMaterial color={snoutColor} roughness={0.9} />
           </Sphere>
           {/* Nostrils */}
           <Sphere args={[0.04, 16, 16]} position={[-0.32, 0.1, 0.14]}>
             <meshStandardMaterial color="#5A3A22" />
           </Sphere>
           <Sphere args={[0.04, 16, 16]} position={[-0.32, 0.1, -0.14]}>
             <meshStandardMaterial color="#5A3A22" />
           </Sphere>
        </group>

        {/* Eyes */}
        <group position={[-0.3, 0.1, 0]}>
          <Sphere args={[0.09, 32, 32]} position={[0, 0, 0.38]}>
            <meshStandardMaterial color="black" roughness={0.2} />
          </Sphere>
          <Sphere args={[0.09, 32, 32]} position={[0, 0, -0.38]}>
            <meshStandardMaterial color="black" roughness={0.2} />
          </Sphere>
          {/* Highlights */}
          <Sphere args={[0.03, 16, 16]} position={[-0.05, 0.05, 0.45]}>
            <meshBasicMaterial color="white" />
          </Sphere>
           <Sphere args={[0.03, 16, 16]} position={[-0.05, 0.05, -0.45]}>
            <meshBasicMaterial color="white" />
          </Sphere>
        </group>

        {/* Ears */}
        <group position={[0.2, 0.55, 0]}>
           <Cone args={[0.18, 0.45, 32]} position={[0, 0, 0.25]} rotation={[0, 0, -0.5]}>
             <meshStandardMaterial color={primaryColor} {...materialProps} />
           </Cone>
           <Cone args={[0.18, 0.45, 32]} position={[0, 0, -0.25]} rotation={[0, 0, -0.5]}>
             <meshStandardMaterial color={primaryColor} {...materialProps} />
           </Cone>
        </group>

        {/* Fluffy Mane (Thick & Messy for Shetland look) */}
        <group position={[0.5, 0.4, 0]} rotation={[0, 0, 0.3]}>
           {/* Center Ridge */}
           <Sphere args={[0.25, 16, 16]} position={[0, 0, 0]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
           <Sphere args={[0.22, 16, 16]} position={[0.15, -0.25, 0]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
           <Sphere args={[0.20, 16, 16]} position={[0.25, -0.5, 0]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
           {/* Side Fluff (Messy) */}
           <Sphere args={[0.18, 16, 16]} position={[0.05, -0.1, 0.15]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
           <Sphere args={[0.18, 16, 16]} position={[0.05, -0.1, -0.15]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
           {/* Forelock (Hair on forehead) */}
           <Sphere args={[0.18, 16, 16]} position={[-0.3, 0.3, 0]}> <meshStandardMaterial {...maneMaterialProps} /> </Sphere>
        </group>

        {/* Hat (Christmas only) */}
        {isChristmas && (
            <group position={[0.1, 0.7, 0]} rotation={[0, 0, -0.3]}>
                <Cylinder args={[0.35, 0.38, 0.15, 32]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="white" roughness={1} />
                </Cylinder>
                <Cone args={[0.32, 0.8, 32]} position={[0, 0.4, 0]}>
                    <meshStandardMaterial color="#D42426" roughness={1} />
                </Cone>
                <Sphere args={[0.12, 16, 16]} position={[0, 0.8, 0]}>
                    <meshStandardMaterial color="white" roughness={1} />
                </Sphere>
            </group>
        )}
      </group>

      {/* --- LEGS with Feathering (Fur at feet) --- */}
      <group>
        {[
          [-0.5, -0.8, 0.35], // Front Left
          [-0.5, -0.8, -0.35], // Front Right
          [0.6, -0.8, 0.35],   // Back Left
          [0.6, -0.8, -0.35]   // Back Right
        ].map((pos, idx) => (
            <group position={[pos[0], pos[1], pos[2]]} key={idx}>
                {/* Leg Shaft */}
                <RoundedBox args={[0.35, 0.7, 0.35]} radius={0.15}>
                    <meshStandardMaterial color={primaryColor} {...materialProps} />
                </RoundedBox>
                {/* Feathering (Fluff at bottom of leg) */}
                <Cone args={[0.25, 0.3, 16]} position={[0, -0.3, 0]} rotation={[0,0,0]}>
                    <meshStandardMaterial color={primaryColor} {...materialProps} />
                </Cone>
                {/* Hoof */}
                <Cylinder args={[0.18, 0.2, 0.15, 32]} position={[0, -0.5, 0]}>
                    <meshStandardMaterial color="#222" roughness={0.8} />
                </Cylinder>
            </group>
        ))}
      </group>

      {/* --- TAIL (Thick & Fluffy) --- */}
      <group position={[0.8, 0.1, 0]} rotation={[0, 0, -0.8]}>
         <Sphere args={[0.3, 16, 16]} scale={[1, 1.8, 1]} position={[0, -0.2, 0]}>
            <meshStandardMaterial {...maneMaterialProps} />
         </Sphere>
         {/* Extra fluff at base */}
         <Sphere args={[0.2, 16, 16]} position={[0, 0.2, 0.1]}>
             <meshStandardMaterial {...maneMaterialProps} />
         </Sphere>
         <Sphere args={[0.2, 16, 16]} position={[0, 0.2, -0.1]}>
             <meshStandardMaterial {...maneMaterialProps} />
         </Sphere>
      </group>

      {/* --- SADDLE / ACCESSORIES --- */}
      <group position={[0, 0.6, 0]}>
         {/* Saddle Pad (Thicker) */}
         <RoundedBox args={[0.8, 0.15, 0.8]} radius={0.08}>
             <meshStandardMaterial color={saddleColor} roughness={0.9} />
         </RoundedBox>
         
         {/* Scarf (Christmas Only) */}
         {isChristmas && (
             <group position={[-0.8, -0.1, 0]} rotation={[0, 0, 0.2]}>
                 <Cylinder args={[0.6, 0.6, 0.25, 32]} rotation={[0, 0, 1.57]}>
                     <meshStandardMaterial color="#D42426" roughness={1} />
                 </Cylinder>
             </group>
         )}
         
         {/* Saddle Decoration */}
         {!isChristmas && (
            <group position={[0, 0.08, 0]} rotation={[-Math.PI/2, 0, 0]}>
                 <Cylinder args={[0.25, 0.25, 0.02, 32]}>
                    <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
                 </Cylinder>
            </group>
         )}
      </group>

    </group>
  );
};

export default PonyModel;
