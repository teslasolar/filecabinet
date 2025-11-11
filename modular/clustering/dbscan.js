// DBSCAN density-based clustering
export function DBSCAN(app) {
  resetClusters(app);

  let clusterId = 0;

  app.pts.forEach(p => {
    if (p.visited) return;
    p.visited = 1;

    const neighbors = getNeighbors(p, app.pts, app.eps);

    if (neighbors.length < app.minPts) {
      markAsNoise(p);
      return;
    }

    expandCluster(p, neighbors, clusterId, app);
    clusterId++;
  });

  app.iter++;
  app.updateStats();
}

function resetClusters(app) {
  app.centroids.forEach(c => app.scene.remove(c.m));
  app.centroids = [];
  app.pts.forEach(p => {
    p.cluster = -1;
    p.visited = 0;
  });
}

function markAsNoise(p) {
  p.cluster = -1;
  p.m.material.color.setHex(0x888888);
  p.m.material.emissive.setHex(0x888888);
}

function expandCluster(p, neighbors, clusterId, app) {
  const color = Math.random() * 0xffffff;
  p.cluster = clusterId;
  p.m.material.color.setHex(color);
  p.m.material.emissive.setHex(color);

  const queue = [...neighbors];

  while (queue.length) {
    const q = queue.shift();
    if (q.visited) continue;

    q.visited = 1;
    const qn = getNeighbors(q, app.pts, app.eps);

    if (qn.length >= app.minPts) {
      queue.push(...qn);
    }

    if (q.cluster === -1) {
      q.cluster = clusterId;
      q.m.material.color.setHex(color);
      q.m.material.emissive.setHex(color);
    }
  }
}

function getNeighbors(p, pts, eps) {
  return pts.filter(q => {
    const d = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
    return d < eps && q !== p;
  });
}
