import * as THREE from 'three';
import { Player } from './GameObjects/Player';
import { GroundPlane } from './GameObjects/GroundPlane';

export class GameScene {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private groundPlane: GroundPlane;
  private isPointerLocked: boolean = false;

  constructor() {
    this.scene = new THREE.Scene();
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

    this.player = new Player();
    this.groundPlane = new GroundPlane(100, 100);

    this.setupScene();
    this.setupControls();
    this.animate();
  }

  private setupScene(): void {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Add ground plane
    this.groundPlane.addToScene(this.scene);

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
        case 'KeyW': this.player.setMoveForward(true); break;
        case 'KeyS': this.player.setMoveBackward(true); break;
        case 'KeyA': this.player.setMoveLeft(true); break;
        case 'KeyD': this.player.setMoveRight(true); break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': this.player.setMoveForward(false); break;
        case 'KeyS': this.player.setMoveBackward(false); break;
        case 'KeyA': this.player.setMoveLeft(false); break;
        case 'KeyD': this.player.setMoveRight(false); break;
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
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.player.move(0.1);
    this.renderer.render(this.scene, this.player.getCamera());
  }
} 