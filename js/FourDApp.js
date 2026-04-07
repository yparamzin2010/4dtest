/**
 * Application orchestrator that composes camera, renderer, input, and loader.
 * Owns startup flow, active scene, and the animation loop lifecycle.
 */
class FourDApp {
  constructor(canvas, ctx, options = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.panel = options.panel || null;

    // Compose app subsystems.
    this.camera = new Camera4D();
    this.renderer = new Renderer4D(canvas, ctx, this.camera);
    this.input = new InputController(canvas, this.camera, { panel: this.panel });
    this.loader = new LevelLoader();
    this.shapeLibrary = new ShapeLibrary();

    this.scene = null;
    this.activeShapeId = null;
    this.running = false;

    this.input.bind();
  }

  async loadLevel(level = 1) {
    this.scene = await this.loader.loadLevel(level);
  }

  loadShapeLibraryDefault() {
    this.setActiveShape(this.shapeLibrary.defaultShapeId);
  }

  setActiveShape(id) {
    const shape = this.shapeLibrary.getShape(id);
    this.activeShapeId = shape.id;
    this.scene = this.shapeLibrary.buildScene(shape.id);
    this.camera.reset(shape.cameraStart);
    return shape;
  }

  getAllShapes() {
    return this.shapeLibrary.getAllShapes();
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
