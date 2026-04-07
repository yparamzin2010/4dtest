/**
 * Input wiring layer between browser events and camera controls.
 * Registers keyboard, mouse look, pointer lock, and zoom handlers.
 */
class InputController {
  constructor(canvas, camera, options = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.panel = options.panel || null;
  }

  // Register all user input handlers in one place.
  bind() {
    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
    });

    this.canvas.addEventListener("mousemove", (event) => {
      // Ignore mouse movement unless pointer is locked to the canvas.
      if (!document.pointerLockElement) {
        return;
      }

      this.camera.rotateByMouse(event.movementX, event.movementY);
    });

    document.addEventListener("keydown", (event) => {
      this.camera.moveByKey(event.key);
    });

    window.addEventListener("wheel", (event) => {
      if (this.panel && this.panel.contains(event.target)) {
        return;
      }

      if (event.target !== this.canvas) {
        return;
      }

      this.camera.zoomByWheel(event.deltaY);
      event.preventDefault();
    }, { passive: false });
  }
}

window.InputController = InputController;
