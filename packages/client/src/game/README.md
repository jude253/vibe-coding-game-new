# Game Architecture

This directory contains the core game implementation, organized into several key subsystems:

## Folder Structure

### gameObjects/
Contains all game entities and objects that exist in the game world. These are typically Three.js meshes or groups of meshes that have a physical presence in the game.

Examples:
- `Player.ts` - The player character and camera controller
- `GroundPlane.ts` - The ground surface of the game world

### ui/
Contains all user interface components that are rendered on top of the game world.

Examples:
- `FpsWidget.ts` - Displays the current frames per second

### utils/
Contains utility classes and functions that provide general functionality used across the game.

Examples:
- `ClientGameState.ts` - Manages game timing, FPS, and delta time

### managers/
Contains system managers that handle specific subsystems of the game. These are typically singleton-like classes that coordinate between different parts of the game.

Examples:
- `NetworkManager.ts` - Handles network prediction, state synchronization, and reconciliation

## Design Principles

1. **Separation of Concerns**
   - Each folder has a clear, distinct purpose
   - Components are organized by their role in the game
   - Dependencies flow from specific to general

2. **Manager Pattern**
   - Managers coordinate between different systems
   - Each manager handles one specific aspect of the game
   - Managers can be enabled/disabled via environment variables

3. **Game Objects**
   - Represent physical entities in the game world
   - Handle their own state and rendering
   - Can be controlled by managers

4. **UI Components**
   - Overlay on top of the game world
   - Handle their own rendering and updates
   - Can be toggled via environment variables

## Environment Variables

The game supports several environment variables for configuration:

- `VITE_ENABLE_NETWORK_SIMULATION` - Enables/disables network prediction simulation
- `VITE_SHOW_FPS` - Shows/hides the FPS counter

## Adding New Components

When adding new components, follow these guidelines:

1. **Game Objects**
   - Place in `gameObjects/` folder
   - Extend or compose with Three.js objects
   - Handle their own state and updates

2. **UI Components**
   - Place in `ui/` folder
   - Handle their own rendering
   - Support enable/disable via environment variables

3. **Managers**
   - Place in `managers/` folder
   - Handle one specific system
   - Coordinate between other components
   - Support configuration via environment variables

4. **Utilities**
   - Place in `utils/` folder
   - Provide general functionality
   - Keep dependencies minimal

## Naming Conventions

- Folder names use camelCase
- File names use PascalCase for classes and camelCase for utilities
- Class names use PascalCase
- Variable and method names use camelCase
- Constants use UPPER_SNAKE_CASE

## Multiplayer Networking

The game implements a client-side prediction and server reconciliation system for multiplayer functionality. This approach balances responsiveness with accuracy in networked gameplay.

### Implementation Details

1. **Client-Side Prediction**
   - Player inputs are processed immediately on the client
   - Movement is predicted locally for instant feedback
   - Inputs and states are stored in buffers for reconciliation

2. **State Synchronization**
   - Server state is received periodically (simulated every 100ms)
   - Client compares predicted state with server state
   - Discrepancies are resolved through reconciliation

3. **Reconciliation Process**
   - When server state differs significantly from prediction:
     - Client rewinds to the server state
     - Replays buffered inputs since that state
     - Re-predicts movement for each input

### Tradeoffs

1. **Advantages**
   - **Responsiveness**: Players experience immediate feedback to their inputs
   - **Smooth Movement**: Local prediction provides fluid motion
   - **Network Tolerance**: Handles latency and packet loss gracefully
   - **Scalability**: Buffer-based approach works well with many players

2. **Disadvantages**
   - **Memory Usage**: Requires storing input and state buffers
   - **CPU Usage**: Replaying inputs can be computationally expensive
   - **Complexity**: More complex than simpler networking approaches
   - **Bandwidth**: Requires sending both inputs and state updates

3. **Tunable Parameters**
   - `bufferSize`: Number of states/inputs to store (default: 100)
   - `reconciliationThreshold`: Position difference that triggers reconciliation (default: 0.1 units)
   - `serverUpdateInterval`: How often to simulate server updates (default: 100ms)

### Future Improvements

1. **Optimizations**
   - Implement input compression
   - Add state interpolation for smoother corrections
   - Optimize buffer management

2. **Features**
   - Add support for multiple players
   - Implement server authority for critical actions
   - Add network condition simulation

3. **Monitoring**
   - Add network statistics display
   - Implement latency compensation
   - Add debug visualization for prediction/reconciliation

### Usage

The networking system can be enabled/disabled via environment variables:
```env
VITE_ENABLE_NETWORK_SIMULATION=1  # Enable network simulation
```

When enabled, the system will:
1. Store player inputs and states
2. Simulate server updates periodically
3. Apply corrections when needed
4. Maintain smooth gameplay despite network conditions 