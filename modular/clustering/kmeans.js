// K-Means clustering algorithm
import { initCentroids, moveCentroids } from './kmeans-helpers.js';

export function KMeans(app, step = false) {
  if (!step) initCentroids(app);
  assignClusters(app);
  moveCentroids(app);
  app.iter++;
  app.updateStats();
}

function assignClusters(app) {
  app.centroids.forEach(c => c.pts = []);

  app.pts.forEach(p => {
    let min = Infinity, best = 0;
    app.centroids.forEach((c, i) => {
      const d = Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z);
      if (d < min) { min = d; best = i; }
    });

    p.cluster = best;
    const col = app.centroids[best].c;
    p.m.material.color.setHex(col);
    p.m.material.emissive.setHex(col);
    app.centroids[best].pts.push(p);
  });
}
