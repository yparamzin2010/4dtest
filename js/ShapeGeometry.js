class ShapeGeometry {
  static tetra(a, b, c, d, col) {
    return {
      tetra: [a, b, c, d].map((vertex) => ({ ...vertex })),
      col: { ...col }
    };
  }

  static cubeToTetrahedra(bounds, col) {
    const { min, max, fixedAxis, fixedValue } = bounds;
    const axes = ["x", "y", "z", "w"];
    const varyingAxes = axes.filter((axis) => axis !== fixedAxis);
    const permutations = [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1]
    ];

    const makeVertex = (bits) => {
      const vertex = { x: 0, y: 0, z: 0, w: 0 };
      vertex[fixedAxis] = fixedValue;

      for (let index = 0; index < varyingAxes.length; index += 1) {
        const axis = varyingAxes[index];
        vertex[axis] = bits[index] ? max : min;
      }

      return vertex;
    };

    return permutations.map((order) => {
      const bits0 = [0, 0, 0];
      const bits1 = [0, 0, 0];
      const bits2 = [0, 0, 0];
      const bits3 = [0, 0, 0];

      bits1[order[0]] = 1;
      bits2[order[0]] = 1;
      bits2[order[1]] = 1;
      bits3[order[0]] = 1;
      bits3[order[1]] = 1;
      bits3[order[2]] = 1;

      return ShapeGeometry.tetra(
        makeVertex(bits0),
        makeVertex(bits1),
        makeVertex(bits2),
        makeVertex(bits3),
        col
      );
    });
  }

  static translate(cells, offset) {
    return cells.map((cell) => ({
      ...cell,
      tetra: cell.tetra.map((vertex) => ({
        x: vertex.x + (offset.x || 0),
        y: vertex.y + (offset.y || 0),
        z: vertex.z + (offset.z || 0),
        w: vertex.w + (offset.w || 0)
      }))
    }));
  }

  static scale(cells, factor) {
    return cells.map((cell) => ({
      ...cell,
      tetra: cell.tetra.map((vertex) => ({
        x: vertex.x * factor,
        y: vertex.y * factor,
        z: vertex.z * factor,
        w: vertex.w * factor
      }))
    }));
  }

  static recolor(cells, col) {
    return cells.map((cell) => ({
      ...cell,
      col: { ...col }
    }));
  }

  static merge(...groups) {
    return groups.flat();
  }

  static center(cells) {
    const vertices = cells.flatMap((cell) => cell.tetra);

    if (vertices.length === 0) {
      return cells;
    }

    const bounds = vertices.reduce((acc, vertex) => ({
      minX: Math.min(acc.minX, vertex.x),
      maxX: Math.max(acc.maxX, vertex.x),
      minY: Math.min(acc.minY, vertex.y),
      maxY: Math.max(acc.maxY, vertex.y),
      minZ: Math.min(acc.minZ, vertex.z),
      maxZ: Math.max(acc.maxZ, vertex.z),
      minW: Math.min(acc.minW, vertex.w),
      maxW: Math.max(acc.maxW, vertex.w)
    }), {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      minZ: Infinity,
      maxZ: -Infinity,
      minW: Infinity,
      maxW: -Infinity
    });

    return ShapeGeometry.translate(cells, {
      x: -((bounds.minX + bounds.maxX) * 0.5),
      y: -((bounds.minY + bounds.maxY) * 0.5),
      z: -((bounds.minZ + bounds.maxZ) * 0.5),
      w: -((bounds.minW + bounds.maxW) * 0.5)
    });
  }

  static sceneFromCells(cells) {
    return {
      tets: {
        preview: cells
      }
    };
  }
}

window.ShapeGeometry = ShapeGeometry;
