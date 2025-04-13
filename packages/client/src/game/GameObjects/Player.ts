import * as THREE from 'three';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private moveUp: boolean = false;
  private moveDown: boolean = false;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private tempVector: THREE.Vector3 = new THREE.Vector3();
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
  private verticalAngle: number = 0;
  private horizontalAngle: number = 0;
  private readonly movementSpeed: number = 0.5; // Units per second
  private readonly dampingFactor: number = 0.95;
  private isGrounded: boolean = true;
  private verticalVelocity: number = 0;
  private readonly gravity: number = -9.8; // Gravity in units per second squared
  private readonly jumpForce: number = 5.0; // Jump force in units per second
  private readonly groundY: number = 1.6; // Player's height when grounded

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.y = this.groundY;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public setMoveForward(value: boolean): void {
    this.moveForward = value;
  }

  public setMoveBackward(value: boolean): void {
    this.moveBackward = value;
  }

  public setMoveLeft(value: boolean): void {
    this.moveLeft = value;
  }

  public setMoveRight(value: boolean): void {
    this.moveRight = value;
  }

  public setMoveUp(value: boolean): void {
    this.moveUp = value;
  }

  public setMoveDown(value: boolean): void {
    this.moveDown = value;
  }

  public jump(): void {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }
  }

  public rotateCamera(deltaX: number, deltaY: number): void {
    // Update rotation angles
    this.horizontalAngle += deltaX;
    this.verticalAngle += deltaY;
    
    // Clamp vertical rotation
    this.verticalAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.verticalAngle));
    
    // Calculate target position based on angles
    this.target.set(
      Math.sin(this.horizontalAngle) * Math.cos(this.verticalAngle),
      Math.sin(this.verticalAngle),
      -Math.cos(this.horizontalAngle) * Math.cos(this.verticalAngle)
    );
    
    // Update camera rotation to look at target
    this.camera.lookAt(this.camera.position.x + this.target.x, 
                      this.camera.position.y + this.target.y, 
                      this.camera.position.z + this.target.z);
  }

  public move(deltaTime: number): void {
    // Apply damping to velocity
    this.velocity.x *= this.dampingFactor;
    this.velocity.z *= this.dampingFactor;

    // Get the camera's forward and right vectors
    const forward = new THREE.Vector3();
    const left = new THREE.Vector3();
    
    // Get the camera's world direction
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on the horizontal plane
    forward.normalize();
    
    // Calculate right vector from forward vector
    left.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

    // Calculate movement direction
    this.tempVector.set(0, 0, 0);
    if (this.moveForward) this.tempVector.add(forward);
    if (this.moveBackward) this.tempVector.sub(forward);
    if (this.moveRight) this.tempVector.sub(left);
    if (this.moveLeft) this.tempVector.add(left);
    
    // Normalize if moving in multiple directions
    if (this.tempVector.length() > 0) {
      this.tempVector.normalize();
    }

    // Apply movement with delta time
    if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
      const speed = this.movementSpeed * deltaTime;
      this.velocity.x += this.tempVector.x * speed;
      this.velocity.z += this.tempVector.z * speed;
    }

    // Apply gravity and jumping
    this.verticalVelocity += this.gravity * deltaTime;
    
    // Update position
    this.camera.position.x += this.velocity.x;
    this.camera.position.z += this.velocity.z;
    this.camera.position.y += this.verticalVelocity * deltaTime;

    // Check if player has landed
    if (this.camera.position.y <= this.groundY) {
      this.camera.position.y = this.groundY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }
  }
} 