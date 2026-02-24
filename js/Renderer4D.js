/**
 * Rendering pipeline for 4D tetrahedra onto the 2D canvas.
 * Handles 4D->3D scaling, 3D rotation, depth sorting, and face drawing.
 */
class Renderer4D {
  constructor(canvas, ctx, camera) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.camera = camera;
    this.scale = 100;

    // Face index triplets for tetrahedron rendering.
    this.faceIndices = [
      [0, 1, 2],
      [0, 1, 3],
      [0, 2, 3],
      [1, 2, 3]
    ];

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Rotate a 3D point by camera angles, then apply simple perspective.
  rotate3D(v) {
    const cosX = Math.cos(this.camera.angleX);
    const sinX = Math.sin(this.camera.angleX);
    const cosY = Math.cos(this.camera.angleY);
    const sinY = Math.sin(this.camera.angleY);

    let x = v.x * cosY - v.z * sinY;
    let z = v.x * sinY + v.z * cosY;

    const y = v.y * cosX - z * sinX;
    z = v.y * sinX + z * cosX;

    const perspective = 1 / (1 + z * 0.1);
    return {
      x: x * perspective * this.camera.zoomDepth,
      y: y * perspective * this.camera.zoomDepth,
      z: z
    };
  }

  // Project 4D point into camera-relative 3D using W-depth scaling.
  scaleOrtho(p) {
    const cameraW = this.camera.cameraW;
    const factor = 1 / (1 + (-p.w + cameraW) * 0.1);

    return {
      x: (p.x - this.camera.position.x) * factor,
      y: (p.y - this.camera.position.y) * factor,
      z: (p.z - this.camera.position.z) * factor,
      w: p.w - this.camera.position.w
    };
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  // Cache per-tetra derived values used by sort and clipping tests.
  prepareTetra(cell) {
    const v = cell._scaled;
    cell._cz = (v[0].z + v[1].z + v[2].z + v[3].z) * 0.25;

    const [A, B, C, D] = v;
    const plane = (a, b, c, d) => {
      const n = Renderer4D.cross(
        { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z },
        { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
      );
      const s = Renderer4D.dot(n, { x: d.x - a.x, y: d.y - a.y, z: d.z - a.z }) > 0 ? 1 : -1;
      return { n, d: -Renderer4D.dot(n, a), s };
    };

    cell._planes = [
      plane(B, C, D, A),
      plane(A, C, D, B),
      plane(A, B, D, C),
      plane(A, B, C, D)
    ];
  }

  drawLabel3D(text, p3) {
    const rotated = this.rotate3D(p3);
    const sx = this.canvas.width / 2 + rotated.x * this.scale;
    const sy = this.canvas.height / 2 + rotated.y * this.scale;

    if (sx < 0 || sx > this.canvas.width || sy < 0 || sy > this.canvas.height) {
      return;
    }

    this.ctx.font = "14px monospace";
    this.ctx.fillStyle = "rgba(255,255,255,0.9)";
    this.ctx.fillText(text, sx + 4, sy - 4);
  }

  // Draw tiny axis cross at the center to show orientation.
  drawViewingBox() {
    const cx0 = this.canvas.width / 2;
    const cy0 = this.canvas.height / 2;
    const r = 0.1;

    const axes = [
      [{ x: -r, y: 0, z: 0 }, { x: r, y: 0, z: 0 }],
      [{ x: 0, y: -r, z: 0 }, { x: 0, y: r, z: 0 }],
      [{ x: 0, y: 0, z: -r }, { x: 0, y: 0, z: r }]
    ];

    this.ctx.strokeStyle = "rgba(0,255,0,0.6)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (const [a0, a1] of axes) {
      const a = this.rotate3D(a0);
      const b = this.rotate3D(a1);
      this.ctx.moveTo(cx0 + a.x * this.scale, cy0 + a.y * this.scale);
      this.ctx.lineTo(cx0 + b.x * this.scale, cy0 + b.y * this.scale);
    }

    this.ctx.stroke();
  }

  draw(sceneData) {
    if (!sceneData) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width >> 1;
    const cy = this.canvas.height >> 1;
    const scenes = sceneData.tets || sceneData;

    // First pass: transform and depth-sort each scene.
    for (const scene of Object.values(scenes)) {
      for (const cell of scene) {
        cell._scaled = cell.tetra.map((v) => this.scaleOrtho(v));
        this.prepareTetra(cell);
      }

      scene.sort((a, b) => b._cz - a._cz);
    }

    // Second pass: draw all tetra faces with distance-based alpha fade.
    for (const scene of Object.values(scenes)) {
      for (const cell of scene) {
        const verts = cell._scaled;

        for (const [i, j, k] of this.faceIndices) {
          const a = verts[i];
          const b = verts[j];
          const c = verts[k];

          const r0 = this.rotate3D(a);
          const r1 = this.rotate3D(b);
          const r2 = this.rotate3D(c);

          const sx0 = cx + r0.x * this.scale;
          const sy0 = cy + r0.y * this.scale;
          const sx1 = cx + r1.x * this.scale;
          const sy1 = cy + r1.y * this.scale;
          const sx2 = cx + r2.x * this.scale;
          const sy2 = cy + r2.y * this.scale;

          const p = {
            x: (a.x + b.x + c.x) / 3,
            y: (a.y + b.y + c.y) / 3,
            z: (a.z + b.z + c.z) / 3,
            w: (a.w + b.w + c.w) / 3
          };

          const dx = p.x - this.camera.position.x;
          const dy = p.y - this.camera.position.y;
          const dz = p.z - this.camera.position.z;
          const dw = Math.abs(p.w - this.camera.cameraW);
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const fade = 1 - Math.min(Math.abs(distance) / (dw + 2), 1);

          this.ctx.fillStyle = `rgba(${cell.col.r}, ${cell.col.g}, ${cell.col.b}, ${cell.col.a * fade})`;
          this.ctx.beginPath();
          this.ctx.moveTo(sx0, sy0);
          this.ctx.lineTo(sx1, sy1);
          this.ctx.lineTo(sx2, sy2);
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
    }

    this.drawViewingBox();
    this.drawLabel3D("Z", { x: 0, y: 2, z: 0 });
    this.drawLabel3D("Q", { x: 0, y: -2, z: 0 });
    this.drawLabel3D("A", { x: -2, y: 0, z: 0 });
    this.drawLabel3D("D", { x: 2, y: 0, z: 0 });
    this.drawLabel3D("W", { x: 0, y: 0, z: -2 });
    this.drawLabel3D("S", { x: 0, y: 0, z: 2 });
  }
}

window.Renderer4D = Renderer4D;
