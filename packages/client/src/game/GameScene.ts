import * as THREE from 'three';

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private moveSpeed = 0.1;
  private mouseSensitivity = 0.002;
  private isLocked = false;
  private playerHeight = 1.7; // Average human height in meters
  private groundY = 0;
  private pitch = 0; // Vertical rotation (up/down)
  private yaw = 0;   // Horizontal rotation (left/right)
  private fpsElement: HTMLElement;
  private lastTime = 0;
  private frameCount = 0;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.container = this.createContainer();
    this.fpsElement = this.createFPSElement();
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.groundY;
    this.scene.add(ground);

    // Add some reference objects
    this.addReferenceObjects();
  }

  private createFPSElement(): HTMLElement {
    const fpsElement = document.createElement('div');
    fpsElement.style.position = 'absolute';
    fpsElement.style.top = '10px';
    fpsElement.style.left = '10px';
    fpsElement.style.color = 'white';
    fpsElement.style.fontFamily = 'Arial, sans-serif';
    fpsElement.style.fontSize = '16px';
    fpsElement.style.textShadow = '1px 1px 1px black';
    fpsElement.textContent = 'FPS: 0';
    this.container.appendChild(fpsElement);
    return fpsElement;
  }

  private updateFPS(currentTime: number) {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.fpsElement.textContent = `FPS: ${fps}`;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  private addReferenceObjects() {
    // Add a grid helper
    const gridHelper = new THREE.GridHelper(100, 100);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Add some cubes for reference
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    
    // Add cubes in a grid pattern
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        if (i === 0 && j === 0) continue; // Skip center
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(i * 2, 0.5, j * 2);
        this.scene.add(cube);
      }
    }
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
    return container;
  }

  private handleResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Update yaw (left/right) and pitch (up/down)
    this.yaw -= movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity;
    
    // Clamp pitch to prevent flipping
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
  };

  private onPointerLockChange = () => {
    this.isLocked = document.pointerLockElement === this.container;
  };

  private updateMovement() {
    // Update camera rotation
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');

    // Handle horizontal movement
    this.velocity.x -= this.velocity.x * 0.1;
    this.velocity.z -= this.velocity.z * 0.1;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.moveSpeed;
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.moveSpeed;

    // Apply horizontal movement
    this.camera.translateX(this.velocity.x);
    this.camera.translateZ(this.velocity.z);

    // Keep camera at ground level
    this.camera.position.y = this.groundY + this.playerHeight;
  }

  public start() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    // Set initial camera position and orientation
    this.camera.position.set(0, this.playerHeight, 5);
    this.camera.lookAt(0, this.playerHeight, 0);
    // Initialize rotations
    this.yaw = this.camera.rotation.y;
    this.pitch = this.camera.rotation.x;

    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.container.addEventListener('click', () => {
      this.container.requestPointerLock();
    });

    const animate = (time: number) => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.updateMovement();
      this.renderer.render(this.scene, this.camera);
      this.updateFPS(time);
    };

    animate(0);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.container.removeChild(this.fpsElement);
    }
  }
} 