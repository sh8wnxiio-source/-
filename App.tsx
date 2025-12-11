import React, { useEffect, useRef, useState } from 'react';
import { initializeHandLandmarker, detectHands } from './services/visionService';
import ARScene from './components/ARScene';
import { HandData, HandGesture } from './types';
import * as THREE from 'three';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [hands, setHands] = useState<HandData[]>([]);
  const requestRef = useRef<number>();
  const [uiState, setUiState] = useState<'idle' | 'single' | 'double'>('idle');
  const [showToast, setShowToast] = useState(false);

  // Load MediaPipe and Camera
  useEffect(() => {
    const setup = async () => {
      try {
        await initializeHandLandmarker();
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
              setLoading(false);
              predict();
            };
          }
        }
      } catch (err) {
        console.error("Error initializing:", err);
        setLoading(false);
      }
    };

    setup();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const predict = () => {
    if (videoRef.current && !videoRef.current.paused && videoRef.current.currentTime > 0) {
      const result = detectHands(videoRef.current, performance.now());
      
      if (result && result.landmarks) {
        processLandmarks(result.landmarks, result.worldLandmarks);
      } else {
        setHands([]);
        setUiState('idle');
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  const processLandmarks = (landmarks: any[], worldLandmarks: any[]) => {
    const processedHands: HandData[] = [];
    let openPalmCount = 0;

    landmarks.forEach((landmark, index) => {
      // 0: Wrist, 5: IndexMCP, 9: MiddleMCP, 13: RingMCP, 17: PinkyMCP
      // 8: IndexTip, 12: MiddleTip, 16: RingTip, 20: PinkyTip
      
      const wrist = new THREE.Vector3(landmark[0].x, landmark[0].y, landmark[0].z);
      const middleMCP = new THREE.Vector3(landmark[9].x, landmark[9].y, landmark[9].z);
      const middleTip = new THREE.Vector3(landmark[12].x, landmark[12].y, landmark[12].z);
      
      // Calculate basic hand scale
      const handSize = wrist.distanceTo(middleMCP); 
      
      // Gesture Detection
      const indexTip = new THREE.Vector3(landmark[8].x, landmark[8].y, landmark[8].z);
      const indexMCP = new THREE.Vector3(landmark[5].x, landmark[5].y, landmark[5].z);
      
      const isIndexExtended = wrist.distanceTo(indexTip) > wrist.distanceTo(indexMCP) * 1.5;
      const isMiddleExtended = wrist.distanceTo(middleTip) > wrist.distanceTo(middleMCP) * 1.5;

      const gesture = (isIndexExtended && isMiddleExtended) ? HandGesture.OPEN_PALM : HandGesture.FIST;

      if (gesture === HandGesture.OPEN_PALM) openPalmCount++;

      // Coordinate mapping
      const viewWidth = 7;
      const viewHeight = 5;

      const x = (0.5 - landmark[9].x) * viewWidth; // Flip X for mirror effect
      const y = (0.5 - landmark[9].y) * viewHeight;
      const z = 0; 

      // Rotation (Simple 2D tilt)
      const palmDirection = new THREE.Vector3().subVectors(middleMCP, wrist).normalize();
      const angle = Math.atan2(palmDirection.x, -palmDirection.y);

      processedHands.push({
        id: `hand-${index}`,
        gesture,
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Vector3(0, 0, -angle),
        // Adjusted scale to fit palm length better
        scale: handSize * 4.5, 
        palmNormal: new THREE.Vector3(0, 0, 1)
      });
    });

    setHands(processedHands);
    
    // Update UI State logic
    if (openPalmCount >= 2) setUiState('double');
    else if (openPalmCount === 1) setUiState('single');
    else setUiState('idle');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Hermès Pony AR',
      text: 'Check out this magical Pony AR experience! 🐴✨',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-900 text-white flex-col">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-serif text-xl">Loading Magic...</p>
        </div>
      )}

      {/* Webcam Feed (Mirrored) */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"
        autoPlay
        playsInline
        muted
      />

      {/* 3D AR Layer */}
      <ARScene hands={hands} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
        {uiState === 'single' && (
           <div className="animate-bounce mt-48 transition-opacity duration-500">
             <h1 
                className="text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 font-cute drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                style={{ WebkitTextStroke: '2px white' }}
             >
               矮马真美
             </h1>
           </div>
        )}
        {uiState === 'double' && (
           <div className="animate-pulse mt-48 text-center transition-opacity duration-500">
             <h1 
                className="text-6xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-green-600 font-serif font-bold drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                style={{ WebkitTextStroke: '2px white' }}
             >
               Chris马s
             </h1>
             <p className="text-white text-2xl mt-4 font-serif drop-shadow-md">✨ Magical Holiday ✨</p>
           </div>
        )}
      </div>

      {/* Share Button (Top Right) */}
      <div className="absolute top-4 right-4 z-30 pointer-events-auto">
        <button 
          onClick={handleShare}
          className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 group shadow-lg"
          title="Share with friends"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Copy Toast */}
      {showToast && (
        <div className="absolute top-20 right-4 z-30 bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm animate-fade-in-down">
          Link Copied! 📋
        </div>
      )}

      {/* Instructions / Idle Text */}
      {!loading && uiState === 'idle' && (
        <div className="absolute top-1/2 left-0 w-full text-center z-20 transform -translate-y-1/2">
             <h2 className="text-4xl md:text-5xl text-white font-serif font-bold drop-shadow-lg animate-pulse">
               Show your open palm ✋
             </h2>
        </div>
      )}
    </div>
  );
};

export default App;