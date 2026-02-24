# 4D Test Renderer

A browser-based JavaScript app that renders a tetrahedra-based 4D scene onto a 2D canvas.

The project loads level geometry from JSON (`lvl1.json`), projects it from 4D into camera-relative 3D, applies camera rotation/perspective, and draws tetrahedron faces each animation frame.

## Purpose

- Experiment with visualizing 4D geometry in a lightweight browser setup.
- Provide interactive navigation through a 4D scene using keyboard + mouse.
- Keep rendering and app logic modular with object-oriented structure.

## What Is a Level?

A level is a JSON scene file (`lvl1.json`, `lvl2.json`, etc.) loaded at runtime by `LevelLoader`.

It contains:

- `tets`: one or more scene groups, each containing tetrahedron cells.
- Each cell has:
  - `tetra`: 4 vertices in 4D (`x`, `y`, `z`, `w`).
  - `col`: color and base alpha (`r`, `g`, `b`, `a`).
- Optional metadata such as `collisionBoxes` for non-render logic.

At runtime, the renderer transforms each tetra vertex from 4D into view space, sorts geometry, and draws the faces each animation frame.

## Architecture

The app is organized into separate classes under `js/`.

### High-level flow

1. `main.js` bootstraps the app.
2. `FourDApp` composes all subsystems.
3. `LevelLoader` loads level data (`lvl1.json`).
4. `InputController` translates browser input events into camera updates.
5. `Renderer4D` runs per-frame projection + draw pipeline.

### Class responsibilities

- `Camera4D`
  - Stores camera position/orientation in 4D context.
  - Computes movement basis vectors from camera angles.
  - Handles movement, mouse-look rotation, and zoom state.

- `Renderer4D`
  - Owns canvas rendering pipeline.
  - Converts 4D vertices to camera-relative 3D (`scaleOrtho`).
  - Applies 3D camera rotation + perspective.
  - Sorts tetrahedra for painter-style rendering.
  - Draws tetrahedron faces with distance-based alpha fading.

- `InputController`
  - Registers keyboard, mouse, pointer-lock, and wheel handlers.
  - Delegates all camera changes to `Camera4D`.

- `LevelLoader`
  - Loads level JSON by naming convention (`lvl{n}.json`).

- `FourDApp`
  - App orchestrator.
  - Initializes subsystems, loads levels, and drives animation loop.

## File layout

- `index.html` - HTML shell and script loading order.
- `lvl1.json` - Level data (tetrahedra and colors).
- `js/Camera4D.js`
- `js/Renderer4D.js`
- `js/InputController.js`
- `js/LevelLoader.js`
- `js/FourDApp.js`
- `js/main.js`

## Controls

- Click canvas: lock pointer for mouse look.
- Mouse move (with pointer lock): rotate camera.
- `W/S`: forward/backward.
- `A/D`: strafe left/right.
- `Q/Z`: vertical movement.
- Uppercase movement keys (`W`, `A`, `S`, `D`, `Q`, `Z`): faster movement.
- Mouse wheel: zoom in/out.

## Running

Open `index.html` in a browser (served from a local web server so JSON fetch works).

Example:

```bash
python3 -m http.server
```

Then open `http://localhost:8000`.
