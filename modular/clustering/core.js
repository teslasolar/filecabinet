import { KMeans, DBSCAN, spawnPoints } from './clustering.js';
import { initScene, updateViz, render } from './viz.js';

class ClusteringApp {
  constructor() {
    this.pts = [];
    this.centroids = [];
    this.method = 'kmeans';
    this.k = 5;
    this.iter = 0;
    this.eps = 15;
    this.minPts = 3;
  }

  async init() {
    initScene(this);
    this.pts = spawnPoints(100, this.scene);
    this.kmeans();
    this.loop();
  }

  kmeans() {
    this.method = 'kmeans';
    KMeans(this);
  }

  dbscan() {
    this.method = 'dbscan';
    DBSCAN(this);
  }

  addPoints() {
    const newPts = spawnPoints(20, this.scene);
    this.pts.push(...newPts);
  }

  reset() {
    this.pts.forEach(p => this.scene.remove(p.m));
    this.centroids.forEach(c => this.scene.remove(c.m));
    this.pts = [];
    this.centroids = [];
    this.iter = 0;
    this.pts = spawnPoints(100, this.scene);
  }

  updateStats() {
    document.getElementById('pts').textContent = this.pts.length;
    const uniqueClusters = new Set(this.pts.map(p => p.cluster).filter(c => c !== -1));
    document.getElementById('cls').textContent = this.method === 'kmeans' ? this.k : uniqueClusters.size;
    document.getElementById('iter').textContent = this.iter;
    document.getElementById('mth').textContent = this.method.toUpperCase();
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    updateViz(this);
    if (this.method === 'kmeans' && Math.random() < 0.1) {
      KMeans(this, true);
    }
    render(this);
  }
}

const app = new ClusteringApp();
window.app = app;
app.init();
