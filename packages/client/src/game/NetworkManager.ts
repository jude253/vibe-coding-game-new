import * as THREE from 'three';
import { Player } from './GameObjects/Player';

interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  timestamp: number;
}

interface PlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  timestamp: number;
}

export class NetworkManager {
  private inputBuffer: Array<PlayerInput> = [];
  private stateBuffer: Array<PlayerState> = [];
  private lastProcessedInput: number = 0;
  private readonly bufferSize: number = 100; // Keep last 100 states/inputs

  constructor(private player: Player) {}

  public storeInput(): void {
    const currentInput: PlayerInput = {
      forward: this.player.getMoveForward(),
      backward: this.player.getMoveBackward(),
      left: this.player.getMoveLeft(),
      right: this.player.getMoveRight(),
      jump: this.player.getJumpPressed(),
      timestamp: Date.now()
    };

    this.inputBuffer.push(currentInput);
    
    // Keep buffer size manageable
    if (this.inputBuffer.length > this.bufferSize) {
      this.inputBuffer.shift();
    }
  }

  public storeState(): void {
    const currentState: PlayerState = {
      position: this.player.getCamera().position.clone(),
      velocity: this.player.getVelocity().clone(),
      timestamp: Date.now()
    };

    this.stateBuffer.push(currentState);
    
    // Keep buffer size manageable
    if (this.stateBuffer.length > this.bufferSize) {
      this.stateBuffer.shift();
    }
  }

  public reconcile(serverState: PlayerState): void {
    // Find the state in our buffer that matches the server's timestamp
    const stateIndex = this.stateBuffer.findIndex(
      state => state.timestamp === serverState.timestamp
    );

    if (stateIndex === -1) return; // State too old or not found

    // Compare our prediction with server state
    const ourState = this.stateBuffer[stateIndex];
    const positionDiff = ourState.position.distanceTo(serverState.position);
    
    // If difference is too large, we need to correct
    if (positionDiff > 0.1) { // Threshold for correction
      // Rewind to the server state
      this.player.getCamera().position.copy(serverState.position);
      this.player.getVelocity().copy(serverState.velocity);
      
      // Replay all inputs since that state
      this.replayInputs(serverState.timestamp);
    }

    // Clean up old states
    this.stateBuffer = this.stateBuffer.slice(stateIndex);
    this.inputBuffer = this.inputBuffer.slice(stateIndex);
  }

  private replayInputs(fromTimestamp: number): void {
    // Reapply all inputs since the server state
    const relevantInputs = this.inputBuffer.filter(
      input => input.timestamp >= fromTimestamp
    );

    // Reset to server state
    const serverState = this.stateBuffer[0];
    this.player.getCamera().position.copy(serverState.position);
    this.player.getVelocity().copy(serverState.velocity);

    // Replay each input
    relevantInputs.forEach(input => {
      this.player.setMoveForward(input.forward);
      this.player.setMoveBackward(input.backward);
      this.player.setMoveLeft(input.left);
      this.player.setMoveRight(input.right);
      if (input.jump) {
        this.player.jump();
      }
      
      // Re-predict movement for this input
      this.player.move(1/60); // Assuming 60 FPS
    });
  }
} 