class ShapeLibrary {
  constructor() {
    this.defaultShapeId = "five-cell";
    this.shapes = this.createRegistry();
    this.shapeMap = new Map(this.shapes.map((shape) => [shape.id, shape]));
  }

  createRegistry() {
    return [
      {
        id: "five-cell",
        name: "5-Cell",
        category: "Regular Polytopes",
        description: "The 4D simplex, built from five tetrahedral cells.",
        cameraStart: {
          position: { x: 0, y: 0, z: 6, w: 0 },
          orbitTarget: { x: 0, y: 0, z: 0 },
          orbitRadius: 6,
          angleX: 0.12,
          angleY: 0.18,
          zoomDepth: 1.15
        },
        build: () => this.buildFiveCell()
      },
      {
        id: "sixteen-cell",
        name: "16-Cell",
        category: "Regular Polytopes",
        description: "The 4D cross polytope, represented by sixteen tetrahedral cells.",
        cameraStart: {
          position: { x: 0, y: 0, z: 7, w: 0 },
          orbitTarget: { x: 0, y: 0, z: 0 },
          orbitRadius: 7,
          angleX: 0.18,
          angleY: 0.42,
          zoomDepth: 1
        },
        build: () => this.buildSixteenCell()
      },
      {
        id: "tesseract",
        name: "Tesseract",
        category: "Regular Polytopes",
        description: "A hypercube preview built from the eight cubic cells of a tesseract.",
        cameraStart: {
          position: { x: 0, y: 0, z: 8, w: 0 },
          orbitTarget: { x: 0, y: 0, z: 0 },
          orbitRadius: 8,
          angleX: 0.14,
          angleY: 0.55,
          zoomDepth: 0.95
        },
        build: () => this.buildTesseract()
      },
      {
        id: "w-prism",
        name: "W Prism",
        category: "Demo Shapes",
        description: "A pair of offset tetrahedra bridged across the W axis to show depth changes.",
        cameraStart: {
          position: { x: 0, y: 0, z: 6, w: 0 },
          orbitTarget: { x: 0, y: 0, z: 0 },
          orbitRadius: 6,
          angleX: 0.1,
          angleY: 0.3,
          zoomDepth: 1.1
        },
        build: () => this.buildWPrism()
      }
    ];
  }

  getCategories() {
    return [...new Set(this.shapes.map((shape) => shape.category))];
  }

  getAllShapes() {
    return this.shapes.slice();
  }

  getShape(id) {
    return this.shapeMap.get(id) || this.shapeMap.get(this.defaultShapeId);
  }

  buildScene(id) {
    const shape = this.getShape(id);
    const cells = shape.build();
    return ShapeGeometry.sceneFromCells(cells);
  }

  buildFiveCell() {
    const vertices = [
      { x: 1, y: 1, z: 1, w: -0.5 },
      { x: 1, y: -1, z: -1, w: -0.5 },
      { x: -1, y: 1, z: -1, w: -0.5 },
      { x: -1, y: -1, z: 1, w: -0.5 },
      { x: 0, y: 0, z: 0, w: 1.6 }
    ];
    const palette = [
      { r: 255, g: 125, b: 110, a: 0.12 },
      { r: 255, g: 176, b: 97, a: 0.12 },
      { r: 114, g: 205, b: 146, a: 0.12 },
      { r: 84, g: 171, b: 221, a: 0.12 },
      { r: 186, g: 127, b: 238, a: 0.12 }
    ];
    const cells = [
      [1, 2, 3, 4],
      [0, 2, 3, 4],
      [0, 1, 3, 4],
      [0, 1, 2, 4],
      [0, 1, 2, 3]
    ].map((indices, index) => ShapeGeometry.tetra(
      vertices[indices[0]],
      vertices[indices[1]],
      vertices[indices[2]],
      vertices[indices[3]],
      palette[index]
    ));

    return ShapeGeometry.scale(ShapeGeometry.center(cells), 1.35);
  }

  buildSixteenCell() {
    const basis = {
      xp: { x: 1.7, y: 0, z: 0, w: 0 },
      xn: { x: -1.7, y: 0, z: 0, w: 0 },
      yp: { x: 0, y: 1.7, z: 0, w: 0 },
      yn: { x: 0, y: -1.7, z: 0, w: 0 },
      zp: { x: 0, y: 0, z: 1.7, w: 0 },
      zn: { x: 0, y: 0, z: -1.7, w: 0 },
      wp: { x: 0, y: 0, z: 0, w: 1.7 },
      wn: { x: 0, y: 0, z: 0, w: -1.7 }
    };
    const xPairs = [["xp", "xn"]];
    const yPairs = [["yp", "yn"]];
    const zPairs = [["zp", "zn"]];
    const wPairs = [["wp", "wn"]];
    const palette = [
      { r: 255, g: 145, b: 110, a: 0.09 },
      { r: 244, g: 198, b: 92, a: 0.09 },
      { r: 113, g: 201, b: 132, a: 0.09 },
      { r: 84, g: 173, b: 229, a: 0.09 }
    ];
    const cells = [];

    for (const [xKeyPos, xKeyNeg] of xPairs) {
      for (const [yKeyPos, yKeyNeg] of yPairs) {
        for (const [zKeyPos, zKeyNeg] of zPairs) {
          for (const [wKeyPos, wKeyNeg] of wPairs) {
            const signs = [
              [xKeyPos, xKeyNeg],
              [yKeyPos, yKeyNeg],
              [zKeyPos, zKeyNeg],
              [wKeyPos, wKeyNeg]
            ];

            for (let mask = 0; mask < 16; mask += 1) {
              const keys = signs.map((pair, index) => pair[(mask >> index) & 1]);
              cells.push(ShapeGeometry.tetra(
                basis[keys[0]],
                basis[keys[1]],
                basis[keys[2]],
                basis[keys[3]],
                palette[mask % palette.length]
              ));
            }
          }
        }
      }
    }

    return ShapeGeometry.center(cells);
  }

  buildTesseract() {
    const palette = [
      { r: 255, g: 128, b: 113, a: 0.06 },
      { r: 255, g: 186, b: 90, a: 0.06 },
      { r: 124, g: 203, b: 126, a: 0.06 },
      { r: 77, g: 172, b: 232, a: 0.06 }
    ];
    const cellDefs = [
      { fixedAxis: "x", fixedValue: -1.6, color: palette[0] },
      { fixedAxis: "x", fixedValue: 1.6, color: palette[0] },
      { fixedAxis: "y", fixedValue: -1.6, color: palette[1] },
      { fixedAxis: "y", fixedValue: 1.6, color: palette[1] },
      { fixedAxis: "z", fixedValue: -1.6, color: palette[2] },
      { fixedAxis: "z", fixedValue: 1.6, color: palette[2] },
      { fixedAxis: "w", fixedValue: -1.6, color: palette[3] },
      { fixedAxis: "w", fixedValue: 1.6, color: palette[3] }
    ];

    const cubes = cellDefs.map((cellDef) => ShapeGeometry.cubeToTetrahedra({
      min: -1.6,
      max: 1.6,
      fixedAxis: cellDef.fixedAxis,
      fixedValue: cellDef.fixedValue
    }, cellDef.color));

    return ShapeGeometry.center(ShapeGeometry.merge(...cubes));
  }

  buildWPrism() {
    const front = [
      ShapeGeometry.tetra(
        { x: 0, y: 1.5, z: 0, w: -1.4 },
        { x: -1.4, y: -1.2, z: 1.1, w: -1.4 },
        { x: 1.4, y: -1.2, z: 1.1, w: -1.4 },
        { x: 0, y: -0.2, z: -1.6, w: -1.4 },
        { r: 255, g: 132, b: 115, a: 0.11 }
      )
    ];
    const back = [
      ShapeGeometry.tetra(
        { x: 0.2, y: 1.3, z: 0.2, w: 1.4 },
        { x: -1.2, y: -1.4, z: 1.3, w: 1.4 },
        { x: 1.6, y: -1.1, z: 1.2, w: 1.4 },
        { x: 0.1, y: -0.1, z: -1.4, w: 1.4 },
        { r: 99, g: 179, b: 255, a: 0.11 }
      )
    ];
    const bridges = [
      ShapeGeometry.tetra(
        front[0].tetra[0],
        front[0].tetra[1],
        back[0].tetra[0],
        back[0].tetra[1],
        { r: 255, g: 210, b: 110, a: 0.08 }
      ),
      ShapeGeometry.tetra(
        front[0].tetra[0],
        front[0].tetra[2],
        back[0].tetra[0],
        back[0].tetra[2],
        { r: 124, g: 214, b: 137, a: 0.08 }
      ),
      ShapeGeometry.tetra(
        front[0].tetra[0],
        front[0].tetra[3],
        back[0].tetra[0],
        back[0].tetra[3],
        { r: 175, g: 136, b: 241, a: 0.08 }
      )
    ];

    return ShapeGeometry.center(ShapeGeometry.merge(front, back, bridges));
  }
}

window.ShapeLibrary = ShapeLibrary;
