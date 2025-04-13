import * as THREE from 'three';
import { Player } from '../gameObjects/Player';
import { Obstacle } from '../gameObjects/Obstacle';

export class CollisionManager {
  private obstacles: Obstacle[];
  private players: Map<string, Player>;

  constructor() {
    this.obstacles = [];
    this.players = new Map();
  }

  public addObstacle(obstacle: Obstacle): void {
    this.obstacles.push(obstacle);
  }

  public addPlayer(id: string, player: Player): void {
    this.players.set(id, player);
  }

  public removePlayer(id: string): void {
    this.players.delete(id);
  }

  public update(): void {
    // Check collisions between players and obstacles
    this.players.forEach(player => {
      this.obstacles.forEach(obstacle => {
        this.checkPlayerObstacleCollision(player, obstacle);
      });
    });

    // Check collisions between players (if needed)
    // this.checkPlayerPlayerCollisions();
  }

  private checkPlayerObstacleCollision(player: Player, obstacle: Obstacle): void {
    const playerPosition = player.getCamera().position;
    const playerRadius = 0.5; // Approximate player radius

    // Calculate the distance between player and obstacle
    const distanceX = Math.abs(playerPosition.x - obstacle.getPosition().x);
    const distanceZ = Math.abs(playerPosition.z - obstacle.getPosition().z);

    // Check if player is within the obstacle's bounds (including player radius)
    if (distanceX < (obstacle.getSize().x / 2 + playerRadius) && 
        distanceZ < (obstacle.getSize().z / 2 + playerRadius)) {
      
      // Check if player is above the obstacle (allowing jumping on top)
      if (playerPosition.y > obstacle.getPosition().y + obstacle.getSize().y / 2) {
        // Player is on top of the obstacle
        if (playerPosition.y - playerRadius < obstacle.getPosition().y + obstacle.getSize().y / 2) {
          player.setPosition(new THREE.Vector3(
            playerPosition.x,
            obstacle.getPosition().y + obstacle.getSize().y / 2 + playerRadius,
            playerPosition.z
          ));
        }
      } else {
        // Player is colliding with the sides
        // Calculate the direction to push the player
        const pushDirection = new THREE.Vector3(
          playerPosition.x - obstacle.getPosition().x,
          0,
          playerPosition.z - obstacle.getPosition().z
        ).normalize();

        // Push the player away from the obstacle
        const newPosition = new THREE.Vector3(
          obstacle.getPosition().x + pushDirection.x * (obstacle.getSize().x / 2 + playerRadius),
          playerPosition.y,
          obstacle.getPosition().z + pushDirection.z * (obstacle.getSize().z / 2 + playerRadius)
        );

        player.setPosition(newPosition);
      }
    }
  }

  // Example of how to implement player-player collisions
  private checkPlayerPlayerCollisions(): void {
    const players = Array.from(this.players.values());
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        this.checkPlayerPlayerCollision(players[i], players[j]);
      }
    }
  }

  private checkPlayerPlayerCollision(player1: Player, player2: Player): void {
    const pos1 = player1.getCamera().position;
    const pos2 = player2.getCamera().position;
    const playerRadius = 0.5;

    const distance = pos1.distanceTo(pos2);
    if (distance < playerRadius * 2) {
      // Push players apart
      const direction = new THREE.Vector3().subVectors(pos1, pos2).normalize();
      const overlap = (playerRadius * 2 - distance) / 2;
      
      const newPos1 = pos1.clone().addScaledVector(direction, overlap);
      const newPos2 = pos2.clone().addScaledVector(direction, -overlap);
      
      player1.setPosition(newPos1);
      player2.setPosition(newPos2);
    }
  }
} 