import * as THREE from 'three';

export class RemotePlayer {
  private mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private rotation: THREE.Quaternion;
  private interpolationBuffer: Array<{ position: THREE.Vector3, rotation: THREE.Quaternion, timestamp: number }>;
  private readonly interpolationTime: number = 100; // ms to interpolate over

  constructor(playerId: string) {
    // Create player mesh (simple cube for now)
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.interpolationBuffer = [];
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public updateFromServer(data: {
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
    timestamp: number
  }): void {
    // Store state for interpolation
    this.interpolationBuffer.push({
      position: new THREE.Vector3().copy(data.position),
      rotation: new THREE.Quaternion().copy(data.rotation),
      timestamp: data.timestamp
    });

    // Keep buffer size manageable (last 5 states)
    if (this.interpolationBuffer.length > 5) {
      this.interpolationBuffer.shift();
    }
  }

  public update(deltaTime: number): void {
    if (this.interpolationBuffer.length < 2) return;

    const currentTime = Date.now();
    const targetTime = currentTime - this.interpolationTime;

    // Find the two states to interpolate between
    let previousState = this.interpolationBuffer[0];
    let nextState = this.interpolationBuffer[1];

    for (let i = 1; i < this.interpolationBuffer.length - 1; i++) {
      if (this.interpolationBuffer[i].timestamp <= targetTime) {
        previousState = this.interpolationBuffer[i];
        nextState = this.interpolationBuffer[i + 1];
      }
    }

    // Calculate interpolation factor
    const timeDiff = nextState.timestamp - previousState.timestamp;
    const factor = timeDiff > 0 ? (targetTime - previousState.timestamp) / timeDiff : 0;
    const clampedFactor = Math.max(0, Math.min(1, factor));

    // Interpolate position and rotation
    this.position.lerpVectors(previousState.position, nextState.position, clampedFactor);
    this.rotation.slerpQuaternions(previousState.rotation, nextState.rotation, clampedFactor);

    // Update mesh
    this.mesh.position.copy(this.position);
    this.mesh.quaternion.copy(this.rotation);
  }
} 