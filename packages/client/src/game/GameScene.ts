import * as THREE from 'three';
import { Player } from './gameObjects/Player';
import { GroundPlane } from './gameObjects/GroundPlane';
import { NetworkManager } from './managers/NetworkManager';
import { PlayerManager } from './managers/PlayerManager';
import { FpsWidget } from './ui/FpsWidget';
import { ClientGameState } from './utils/ClientGameState';

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private groundPlane: GroundPlane;
  private networkManager: NetworkManager;
  private playerManager: PlayerManager;
  private gameState: ClientGameState;
  private fpsWidget: FpsWidget;
  private isPointerLocked: boolean = false;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.appendChild(this.renderer.domElement);

    // Initialize game objects
    this.player = new Player();
    this.groundPlane = new GroundPlane();

    // Initialize managers
    this.playerManager = new PlayerManager(this.scene);
    this.playerManager.setLocalPlayer(this.player);
    this.networkManager = new NetworkManager(this.player);
    this.gameState = new ClientGameState();
    this.fpsWidget = new FpsWidget();
  }

  public start(): void {
    this.groundPlane.addToScene(this.scene);
    this.setupScene();
    this.setupControls();
    this.update();
  }

  private setupScene(): void {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Add reference cubes
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    
    const cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube1.position.set(5, 0.5, 0);
    this.scene.add(cube1);

    const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube2.position.set(-5, 0.5, 0);
    this.scene.add(cube2);

    const cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube3.position.set(0, 0.5, 5);
    this.scene.add(cube3);

    const cube4 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube4.position.set(0, 0.5, -5);
    this.scene.add(cube4);
  }

  private setupControls(): void {
    // Handle window resize
    window.addEventListener('resize', () => {
      const camera = this.player.getCamera();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle keyboard input
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.player.setMoveForward(true);
          break;
        case 'KeyS':
          this.player.setMoveBackward(true);
          break;
        case 'KeyA':
          this.player.setMoveLeft(true);
          break;
        case 'KeyD':
          this.player.setMoveRight(true);
          break;
        case 'Space':
          this.player.jump();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.player.setMoveForward(false);
          break;
        case 'KeyS':
          this.player.setMoveBackward(false);
          break;
        case 'KeyA':
          this.player.setMoveLeft(false);
          break;
        case 'KeyD':
          this.player.setMoveRight(false);
          break;
      }
    });

    // Handle mouse movement
    document.addEventListener('mousemove', (event) => {
      if (this.isPointerLocked) {
        this.player.rotateCamera(event.movementX * 0.002, -event.movementY * 0.002);
      }
    });

    // Handle pointer lock
    document.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.renderer.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isPointerLocked) {
        document.exitPointerLock();
      }
    });
  }

  private update(): void {
    requestAnimationFrame(() => this.update());

    // Update game state
    this.gameState.update();
    const deltaTime = this.gameState.getDeltaTime();

    // Store current input and state for prediction
    this.networkManager.storeInput();
    this.networkManager.storeState();

    // Update player movement
    this.player.move(deltaTime);

    // Simulate server update if enabled
    if (import.meta.env.VITE_ENABLE_NETWORK_SIMULATION === "1" && this.gameState.getFrames() % 6 === 0) {
      this.simulateServerUpdate();
    }

    // Update all players
    this.playerManager.update(deltaTime);

    // Update camera position
    this.camera.position.copy(this.player.getCamera().position);
    this.camera.rotation.copy(this.player.getCamera().rotation);

    // Render scene
    this.renderer.render(this.scene, this.camera);

    // Update FPS display if enabled
    if (import.meta.env.VITE_SHOW_FPS === "1") {
      this.fpsWidget.update(this.gameState.getFps());
    }
  }

  // Simulate receiving server state (for testing)
  private simulateServerUpdate(): void {
    // Simulate local player update
    const serverState = {
      position: this.player.getCamera().position.clone(),
      velocity: this.player.getVelocity().clone(),
      timestamp: Date.now()
    };
    
    // Add some random noise to simulate network conditions
    serverState.position.x += (Math.random() - 0.5) * 0.2;
    serverState.position.z += (Math.random() - 0.5) * 0.2;
    
    this.networkManager.reconcile(serverState);

    // Simulate remote player updates
    this.simulateRemotePlayers();
  }

  private simulateRemotePlayers(): void {
    // In a real game, this would come from the server
    const remotePlayerData = {
      position: new THREE.Vector3(
        Math.sin(Date.now() * 0.001) * 5,
        1.6,
        Math.cos(Date.now() * 0.001) * 5
      ),
      rotation: new THREE.Quaternion(),
      timestamp: Date.now()
    };

    // Update or create remote player
    const playerId = "remote1";
    if (!this.playerManager.getRemotePlayers().has(playerId)) {
      this.playerManager.addRemotePlayer(playerId);
    }
    this.playerManager.updateRemotePlayer(playerId, remotePlayerData);
  }

  public dispose(): void {
    this.fpsWidget.dispose();
  }
} 