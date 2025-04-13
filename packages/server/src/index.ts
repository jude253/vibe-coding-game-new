import express from 'express';
import { WebSocketServer } from 'ws';
import { GameState } from '@vibe/shared';

const app = express();
const port = process.env.PORT || 3000;

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    // Handle game messages
  });
});

// Start HTTP server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 