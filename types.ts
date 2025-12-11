import { Vector3 } from 'three';

export enum HandGesture {
  OPEN_PALM = 'OPEN_PALM',
  FIST = 'FIST',
  UNKNOWN = 'UNKNOWN',
}

export interface HandData {
  id: string; // 'Left' or 'Right'
  gesture: HandGesture;
  position: Vector3; // World position for the 3D model
  rotation: Vector3; // Euler angles
  scale: number; // Scale based on hand size
  palmNormal: Vector3;
}

export interface GameState {
  hands: HandData[];
  handCount: number;
}
