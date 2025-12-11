import { Shape } from 'three';

// Create a cute, chibi-style pony silhouette
export const createPonyShape = (): Shape => {
  const s = new Shape();
  
  // Scale factor to keep coordinates manageable
  const sc = 0.8;

  // Start at chest/neck junction
  s.moveTo(-0.5 * sc, 0.3 * sc);
  
  // Front Leg (Stubby)
  s.lineTo(-0.6 * sc, -1.0 * sc);
  s.bezierCurveTo(-0.6 * sc, -1.3 * sc, -0.2 * sc, -1.3 * sc, -0.2 * sc, -1.0 * sc);
  s.lineTo(-0.2 * sc, -0.3 * sc); 
  
  // Belly (Round)
  s.bezierCurveTo(0.2 * sc, -0.6 * sc, 0.8 * sc, -0.6 * sc, 1.2 * sc, -0.3 * sc);
  
  // Back Leg (Stubby)
  s.lineTo(1.2 * sc, -1.0 * sc);
  s.bezierCurveTo(1.2 * sc, -1.3 * sc, 1.6 * sc, -1.3 * sc, 1.6 * sc, -1.0 * sc);
  s.lineTo(1.6 * sc, 0.5 * sc);
  
  // Rump (Round and high)
  s.bezierCurveTo(1.9 * sc, 0.8 * sc, 1.8 * sc, 1.4 * sc, 1.4 * sc, 1.5 * sc);
  
  // Back (Short dip)
  s.quadraticCurveTo(0.9 * sc, 1.2 * sc, 0.4 * sc, 1.5 * sc);
  
  // Mane/Neck (Thick)
  s.quadraticCurveTo(0.3 * sc, 2.0 * sc, 0.1 * sc, 2.2 * sc);
  
  // Ears (Rounded)
  s.lineTo(0.2 * sc, 2.5 * sc);
  s.lineTo(0.0 * sc, 2.4 * sc);
  s.lineTo(-0.2 * sc, 2.5 * sc);
  s.lineTo(-0.3 * sc, 2.2 * sc);

  // Forehead (Bulbous)
  s.bezierCurveTo(-0.8 * sc, 2.2 * sc, -1.2 * sc, 1.8 * sc, -1.2 * sc, 1.4 * sc);
  
  // Snout (Cute button nose)
  s.bezierCurveTo(-1.3 * sc, 1.2 * sc, -1.3 * sc, 0.9 * sc, -1.0 * sc, 0.9 * sc);
  
  // Throat
  s.quadraticCurveTo(-0.8 * sc, 0.6 * sc, -0.5 * sc, 0.3 * sc);

  return s;
};

// Simple saddle shape to sit on back
export const createSaddleShape = (): Shape => {
  const s = new Shape();
  const w = 0.5;
  const h = 0.4;
  
  s.moveTo(-w, -h);
  s.lineTo(w, -h);
  s.bezierCurveTo(w + 0.1, -h, w + 0.1, h, w, h);
  s.lineTo(-w, h);
  s.bezierCurveTo(-w - 0.1, h, -w - 0.1, -h, -w, -h);
  
  return s;
};
