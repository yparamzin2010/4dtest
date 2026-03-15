/**
 * Application orchestrator that composes camera, renderer, input, and loader.
 * Owns startup flow, active scene, and the animation loop lifecycle.
 */
class FourDApp {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;

    // Compose app subsystems.
    this.camera = new Camera4D();
    this.renderer = new Renderer4D(canvas, ctx, this.camera);
    this.input = new InputController(canvas, this.camera);
    this.loader = new LevelLoader();

    this.scene = null;
    this.running = false;

    this.input.bind();
  }

  async loadLevel(level = 1) {
    this.scene = await this.loader.loadLevel(level);
  }

  // Main loop: render current scene every animation frame.
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    const frame = () => {
      if (!this.running) {
        return;
      }

      this.renderer.draw(this.scene);
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}

window.FourDApp = FourDApp;
