import * as THREE from 'three';

export class GroundPlane {
  private plane: THREE.Mesh;
  private grid: THREE.GridHelper;

  constructor(size: number = 100, divisions: number = 100) {
    // Create ground plane
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = 0;

    // Create grid helper
    this.grid = new THREE.GridHelper(size, divisions);
    this.grid.position.y = 0.01; // Slightly above the plane to prevent z-fighting
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.plane);
    scene.add(this.grid);
  }

  public getGroundY(): number {
    return this.plane.position.y;
  }
} 