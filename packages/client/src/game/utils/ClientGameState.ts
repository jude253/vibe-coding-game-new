export class ClientGameState {
    private frames: number = 0;
    private lastFpsUpdate: number = 0;
    private lastFrameTime: number = 0;
    private fps: number = 0;
    private deltaTime: number = 0;
  
    constructor() {
      this.lastFpsUpdate = performance.now();
      this.lastFrameTime = this.lastFpsUpdate;
    }
  
    public update(): void {
      const currentTime = performance.now();
      
      // Calculate delta time for this frame
      this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;
      
      // Update FPS counter
      this.frames++;
      if (currentTime - this.lastFpsUpdate >= 1000) {
        this.fps = Math.round(this.frames);
        this.frames = 0;
        this.lastFpsUpdate = currentTime;
      }
    }
  
    public getFps(): number {
      return this.fps;
    }
  
    public getDeltaTime(): number {
      return this.deltaTime;
    }
  
    public getFrames(): number {
      return this.frames;
    }
  }
  