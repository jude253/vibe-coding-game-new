import * as THREE from 'three';
import { Player } from './Player';

export class Obstacle {
  private mesh: THREE.Mesh;
  private size: THREE.Vector3;
  private position: THREE.Vector3;

  constructor(position: THREE.Vector3, size: THREE.Vector3 = new THREE.Vector3(1, 1, 1)) {
    this.position = position;
    this.size = size;

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getSize(): THREE.Vector3 {
    return this.size;
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  public checkCollision(player: Player): void {
    const playerPosition = player.getCamera().position;
    const playerRadius = 0.5; // Approximate player radius

    // Calculate the distance between player and obstacle
    const distanceX = Math.abs(playerPosition.x - this.position.x);
    const distanceZ = Math.abs(playerPosition.z - this.position.z);

    // Check if player is within the obstacle's bounds (including player radius)
    if (distanceX < (this.size.x / 2 + playerRadius) && 
        distanceZ < (this.size.z / 2 + playerRadius)) {
      
      // Check if player is above the obstacle (allowing jumping on top)
      if (playerPosition.y > this.position.y + this.size.y / 2) {
        // Player is on top of the obstacle
        if (playerPosition.y - playerRadius < this.position.y + this.size.y / 2) {
          player.setPosition(new THREE.Vector3(
            playerPosition.x,
            this.position.y + this.size.y / 2 + playerRadius,
            playerPosition.z
          ));
        }
      } else {
        // Player is colliding with the sides
        // Calculate the direction to push the player
        const pushDirection = new THREE.Vector3(
          playerPosition.x - this.position.x,
          0,
          playerPosition.z - this.position.z
        ).normalize();

        // Push the player away from the obstacle
        const newPosition = new THREE.Vector3(
          this.position.x + pushDirection.x * (this.size.x / 2 + playerRadius),
          playerPosition.y,
          this.position.z + pushDirection.z * (this.size.z / 2 + playerRadius)
        );

        player.setPosition(newPosition);
      }
    }
  }
} 