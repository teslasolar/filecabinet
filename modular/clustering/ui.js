// UI updates and statistics
export function updateStats(app) {
  document.getElementById('pts').textContent = app.pts.length;

  const uniqueClusters = new Set(
    app.pts.map(p => p.cluster).filter(c => c !== -1)
  );

  const clusterCount = app.method === 'kmeans'
    ? app.k
    : uniqueClusters.size;

  document.getElementById('cls').textContent = clusterCount;
  document.getElementById('iter').textContent = app.iter;
  document.getElementById('mth').textContent = app.method.toUpperCase();
}

export function setupEventListeners(app) {
  window.addEventListener('resize', () => {
    if (app.camera && app.renderer) {
      app.camera.aspect = innerWidth / innerHeight;
      app.camera.updateProjectionMatrix();
      app.renderer.setSize(innerWidth, innerHeight);
    }
  });
}
