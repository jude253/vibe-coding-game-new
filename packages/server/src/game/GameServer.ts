import { WebSocket } from 'ws';
import { GameState, Player, GameEvent } from '@vibe/shared';

export class GameServer {
  private gameState: GameState;
  private clients: Map<string, WebSocket> = new Map();

  constructor() {
    this.gameState = {
      players: [],
      timestamp: Date.now()
    };
  }

  public handleConnection(ws: WebSocket, playerId: string) {
    this.clients.set(playerId, ws);

    // Send initial game state
    this.sendGameState(playerId);

    ws.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString()) as GameEvent;
        this.handleGameEvent(playerId, event);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(playerId);
    });
  }

  private handleGameEvent(playerId: string, event: GameEvent) {
    switch (event.type) {
      case 'playerUpdate':
        this.updatePlayer(playerId, event.payload);
        break;
      // Add more event types as needed
    }
  }

  private updatePlayer(playerId: string, playerData: Partial<Player>) {
    const existingPlayer = this.gameState.players.find(p => p.id === playerId);
    
    if (existingPlayer) {
      Object.assign(existingPlayer, playerData);
    } else {
      this.gameState.players.push({
        id: playerId,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        health: 100,
        ...playerData
      });
    }

    this.broadcastGameState();
  }

  private handleDisconnection(playerId: string) {
    this.clients.delete(playerId);
    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    this.broadcastGameState();
  }

  private sendGameState(playerId: string) {
    const ws = this.clients.get(playerId);
    if (ws) {
      ws.send(JSON.stringify(this.gameState));
    }
  }

  private broadcastGameState() {
    const message = JSON.stringify(this.gameState);
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
} 