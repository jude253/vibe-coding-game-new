import * as THREE from 'three';

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.cube = this.createCube();
    this.container = this.createContainer();
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

  private createCube(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    return new THREE.Mesh(geometry, material);
  }

  private handleResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public start() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    this.scene.add(this.cube);
    this.camera.position.z = 5;

    window.addEventListener('resize', this.handleResize);

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
} 