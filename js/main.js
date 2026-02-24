(async function bootstrap() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const app = new FourDApp(canvas, ctx);

  // Load initial level, then start continuous rendering.
  await app.loadLevel(1);
  app.start();

  // Expose for quick debugging in the browser console.
  window.app = app;
})();
