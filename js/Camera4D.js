/**
 * Camera state and movement model in 4D space.
 * Owns orientation, position, and camera-relative movement vectors.
 */
class Camera4D {
  constructor() {
    // Camera orientation and projection depth settings.
    this.zoomDepth = 1;
    this.angleX = 0;
    this.angleY = 0;

    // Camera position in 4D space.
    this.position = { x: 0, y: 0, z: 0, w: 0 };
    this.cameraWOffset = 5;
  }

  // Effective camera W plane used by the 4D perspective factor.
  get cameraW() {
    return this.position.w + this.cameraWOffset;
  }

  // Build camera-relative movement vectors from current Euler angles.
  getBasisVectors() {
    const forward = {
      x: -Math.sin(this.angleY) * Math.cos(this.angleX),
      y: -Math.sin(this.angleX),
      z: -Math.cos(this.angleY) * Math.cos(this.angleX)
    };

    const right = {
      x: -Math.cos(this.angleY),
      y: 0,
      z: Math.sin(this.angleY)
    };

    const up = {
      x: Math.sin(this.angleY) * Math.sin(this.angleX),
      y: Math.cos(this.angleX),
      z: Math.cos(this.angleY) * Math.sin(this.angleX)
    };

    return { forward, right, up };
  }

  // Keyboard movement: uppercase uses faster speed.
  moveByKey(key) {
    const { forward, right, up } = this.getBasisVectors();
    const baseSpeed = -0.02;
    const fastSpeed = -0.05;
    const speed = key === key.toUpperCase() ? fastSpeed : baseSpeed;

    if (key === "w" || key === "W") {
      this.position.x += forward.x * speed;
      this.position.y += forward.y * speed;
      this.position.z += forward.z * speed;
    }
    if (key === "s" || key === "S") {
      this.position.x -= forward.x * speed;
      this.position.y -= forward.y * speed;
      this.position.z -= forward.z * speed;
    }
    if (key === "d" || key === "D") {
      this.position.x += right.x * speed;
      this.position.y += right.y * speed;
      this.position.z += right.z * speed;
    }
    if (key === "a" || key === "A") {
      this.position.x -= right.x * speed;
      this.position.y -= right.y * speed;
      this.position.z -= right.z * speed;
    }
    if (key === "q" || key === "Q") {
      this.position.x += up.x * speed;
      this.position.y += up.y * speed;
      this.position.z += up.z * speed;
    }
    if (key === "z" || key === "Z") {
      this.position.x -= up.x * speed;
      this.position.y -= up.y * speed;
      this.position.z -= up.z * speed;
    }
  }

  // Pointer-lock mouse look.
  rotateByMouse(deltaX, deltaY) {
    this.angleY += deltaX * 0.005;
    this.angleX += deltaY * 0.005;
  }

  // Mouse wheel zoom with clamp for stability.
  zoomByWheel(deltaY) {
    this.zoomDepth -= deltaY * 0.001;
    this.zoomDepth = Math.max(0.5, Math.min(3, this.zoomDepth));
  }
}

window.Camera4D = Camera4D;
