import * as THREE from 'three';

export class FpsWidget {
  private element: HTMLDivElement;

  constructor() {
    // Create the FPS display element
    this.element = document.createElement('div');
    this.element.style.position = 'fixed';
    this.element.style.top = '10px';
    this.element.style.right = '10px';
    this.element.style.color = 'white';
    this.element.style.fontFamily = 'Arial, sans-serif';
    this.element.style.fontSize = '16px';
    this.element.style.zIndex = '1000';
    this.element.style.padding = '5px';
    this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.element.style.borderRadius = '5px';
    document.body.appendChild(this.element);
  }

  public update(fps: number): void {
    this.element.textContent = `FPS: ${fps}`;
  }

  public dispose(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 