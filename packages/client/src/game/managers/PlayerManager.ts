import * as THREE from 'three';
import { Player } from '../gameObjects/Player';
import { RemotePlayer } from '../gameObjects/RemotePlayer';

export class PlayerManager {
  private localPlayer: Player;
  private remotePlayers: Map<string, RemotePlayer>;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.remotePlayers = new Map();
  }

  public setLocalPlayer(player: Player): void {
    this.localPlayer = player;
  }

  public addRemotePlayer(playerId: string): RemotePlayer {
    const remotePlayer = new RemotePlayer(playerId);
    this.remotePlayers.set(playerId, remotePlayer);
    this.scene.add(remotePlayer.getMesh());
    return remotePlayer;
  }

  public removeRemotePlayer(playerId: string): void {
    const player = this.remotePlayers.get(playerId);
    if (player) {
      this.scene.remove(player.getMesh());
      this.remotePlayers.delete(playerId);
    }
  }

  public updateRemotePlayer(playerId: string, data: {
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
    timestamp: number
  }): void {
    const player = this.remotePlayers.get(playerId);
    if (player) {
      player.updateFromServer(data);
    }
  }

  public update(deltaTime: number): void {
    // Update all remote players
    this.remotePlayers.forEach(player => {
      player.update(deltaTime);
    });
  }

  public getLocalPlayer(): Player {
    return this.localPlayer;
  }

  public getRemotePlayers(): Map<string, RemotePlayer> {
    return this.remotePlayers;
  }
} 