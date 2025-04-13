import { GameState } from '@vibe/shared';
import { GameScene } from './game/GameScene';

console.log('Starting application...');

class GameClient {
  private gameState: GameState | null = null;

  constructor() {
    console.log('Game client initialized');
  }

  public start() {
    console.log('Game client started');
  }
}

const game = new GameClient();
game.start();

// Initialize the game scene
const gameScene = new GameScene();
gameScene.start(); 