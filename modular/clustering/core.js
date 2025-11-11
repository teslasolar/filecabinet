import { spawnPoints } from './points.js';
import { KMeans } from './kmeans.js';
import { DBSCAN } from './dbscan.js';
import { initScene, updateViz, render } from './viz.js';
import { updateStats, setupEventListeners } from './ui.js';

class ClusteringApp {
  constructor() {
    this.pts = [];
    this.centroids = [];
    this.method = 'kmeans';
    this.k = 5;
    this.iter = 0;
    this.eps = 15;
    this.minPts = 3;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }

  async init() {
    initScene(this);
    this.pts = spawnPoints(100, this.scene);
    this.kmeans();
    setupEventListeners(this);
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
    this.updateStats();
  }

  reset() {
    this.pts.forEach(p => this.scene.remove(p.m));
    this.centroids.forEach(c => this.scene.remove(c.m));
    this.pts = [];
    this.centroids = [];
    this.iter = 0;
    this.pts = spawnPoints(100, this.scene);
    this.kmeans();
  }

  updateStats() {
    updateStats(this);
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
