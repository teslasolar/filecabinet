// K-Means helper functions
export function initCentroids(app) {
  app.centroids.forEach(c => app.scene.remove(c.m));
  app.centroids = [];

  for (let i = 0; i < app.k; i++) {
    const p = app.pts[Math.floor(Math.random() * app.pts.length)];
    const col = Math.random() * 0xffffff;
    const g = new THREE.BoxGeometry(5, 5, 5);
    const m = new THREE.MeshPhongMaterial({
      color: col, emissive: col, emissiveIntensity: 0.8
    });

    const c = {
      m: new THREE.Mesh(g, m),
      x: p.x, y: p.y, z: p.z, c: col, pts: []
    };

    c.m.position.set(p.x, p.y, p.z);
    app.scene.add(c.m);
    app.centroids.push(c);
  }
  app.iter = 0;
}

export function moveCentroids(app) {
  app.centroids.forEach(c => {
    if (!c.pts.length) return;

    const ax = c.pts.reduce((s, p) => s + p.x, 0) / c.pts.length;
    const ay = c.pts.reduce((s, p) => s + p.y, 0) / c.pts.length;
    const az = c.pts.reduce((s, p) => s + p.z, 0) / c.pts.length;

    c.x += (ax - c.x) * 0.1;
    c.y += (ay - c.y) * 0.1;
    c.z += (az - c.z) * 0.1;
    c.m.position.set(c.x, c.y, c.z);
  });
}
