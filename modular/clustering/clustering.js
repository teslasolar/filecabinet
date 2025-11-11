export function spawnPoints(n, scene) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const cluster = Math.floor(Math.random() * 5);
    const centers = [[-30, -30], [30, -30], [-30, 30], [30, 30], [0, 0]];
    const cx = centers[cluster];
    const x = cx[0] + (Math.random() - 0.5) * 20;
    const z = cx[1] + (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 40;

    const g = new THREE.SphereGeometry(1, 6, 6);
    const m = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
    const p = { m: new THREE.Mesh(g, m), x, y, z, cluster: -1, visited: 0 };
    p.m.position.set(x, y, z);
    scene.add(p.m);
    pts.push(p);
  }
  return pts;
}

export function KMeans(app, step = false) {
  if (!step) {
    app.centroids.forEach(c => app.scene.remove(c.m));
    app.centroids = [];
    for (let i = 0; i < app.k; i++) {
      const p = app.pts[Math.floor(Math.random() * app.pts.length)];
      const g = new THREE.BoxGeometry(5, 5, 5);
      const color = Math.random() * 0xffffff;
      const m = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
      const cent = { m: new THREE.Mesh(g, m), x: p.x, y: p.y, z: p.z, c: color, pts: [] };
      cent.m.position.set(p.x, p.y, p.z);
      app.scene.add(cent.m);
      app.centroids.push(cent);
    }
    app.iter = 0;
  }

  app.centroids.forEach(c => c.pts = []);
  app.pts.forEach(p => {
    let minD = Infinity, bestC = 0;
    app.centroids.forEach((c, i) => {
      const d = Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z);
      if (d < minD) { minD = d; bestC = i; }
    });
    p.cluster = bestC;
    p.m.material.color.setHex(app.centroids[bestC].c);
    p.m.material.emissive.setHex(app.centroids[bestC].c);
    app.centroids[bestC].pts.push(p);
  });

  app.centroids.forEach(c => {
    if (c.pts.length === 0) return;
    const avgX = c.pts.reduce((s, p) => s + p.x, 0) / c.pts.length;
    const avgY = c.pts.reduce((s, p) => s + p.y, 0) / c.pts.length;
    const avgZ = c.pts.reduce((s, p) => s + p.z, 0) / c.pts.length;
    c.x += (avgX - c.x) * 0.1;
    c.y += (avgY - c.y) * 0.1;
    c.z += (avgZ - c.z) * 0.1;
    c.m.position.set(c.x, c.y, c.z);
  });
  app.iter++;
  app.updateStats();
}

export function DBSCAN(app) {
  app.centroids.forEach(c => app.scene.remove(c.m));
  app.centroids = [];
  app.pts.forEach(p => { p.cluster = -1; p.visited = 0; });

  let clusterId = 0;
  app.pts.forEach(p => {
    if (p.visited) return;
    p.visited = 1;
    const neighbors = getNeighbors(p, app.pts, app.eps);
    if (neighbors.length < app.minPts) {
      p.cluster = -1;
      p.m.material.color.setHex(0x888888);
      p.m.material.emissive.setHex(0x888888);
      return;
    }
    p.cluster = clusterId;
    const c = Math.random() * 0xffffff;
    p.m.material.color.setHex(c);
    p.m.material.emissive.setHex(c);

    const queue = [...neighbors];
    while (queue.length) {
      const q = queue.shift();
      if (q.visited) continue;
      q.visited = 1;
      const qn = getNeighbors(q, app.pts, app.eps);
      if (qn.length >= app.minPts) queue.push(...qn);
      if (q.cluster === -1) {
        q.cluster = clusterId;
        q.m.material.color.setHex(c);
        q.m.material.emissive.setHex(c);
      }
    }
    clusterId++;
  });
  app.iter++;
  app.updateStats();
}

function getNeighbors(p, pts, eps) {
  return pts.filter(q => {
    const d = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
    return d < eps && q !== p;
  });
}
