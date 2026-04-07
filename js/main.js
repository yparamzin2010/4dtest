(async function bootstrap() {
  const canvas = document.getElementById("canvas");
  const panelRoot = document.getElementById("library-panel");
  const ctx = canvas.getContext("2d");

  const app = new FourDApp(canvas, ctx, { panel: panelRoot });
  const panel = new LibraryPanel(panelRoot, {
    onSelect: (shapeId) => {
      const shape = app.setActiveShape(shapeId);
      panel.setActiveShape(shape);
    }
  });

  app.loadShapeLibraryDefault();
  panel.render(app.getAllShapes(), app.activeShapeId);
  panel.setActiveShape(app.shapeLibrary.getShape(app.activeShapeId));
  app.start();

  // Expose for quick debugging in the browser console.
  window.app = app;
  window.libraryPanel = panel;
})();
