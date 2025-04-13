export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  id: string;
  position: Vector3;
  rotation: Vector3;
  health: number;
}

export interface GameState {
  players: Player[];
  timestamp: number;
}

export interface GameEvent {
  type: string;
  payload: any;
  timestamp: number;
} 