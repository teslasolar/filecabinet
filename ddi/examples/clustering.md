# 🎨 Clustering DDI
*Document Driven Interface for K-Means and DBSCAN clustering*

## Overview
This document is both documentation AND executable code. Each code block can be run independently or as a complete system.

## Configuration
Set up the clustering parameters:

```javascript
const config = {
  pointCount: 100,
  clusters: 5,
  epsilon: 15,
  minPoints: 3,
  canvasId: 'clustering-canvas'
};
window.clusterConfig = config;
return config;
```

## Point Generation
Generate random 3D points in clusters:

```javascript
function generatePoints(n, scene) {
  const points = [];
  const centers = [[-30, -30], [30, -30], [-30, 30], [30, 30], [0, 0]];

  for (let i = 0; i < n; i++) {
    const cluster = Math.floor(Math.random() * 5);
    const cx = centers[cluster];
    const x = cx[0] + (Math.random() - 0.5) * 20;
    const z = cx[1] + (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 40;

    const geometry = new THREE.SphereGeometry(1, 6, 6);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });

    const point = {
      mesh: new THREE.Mesh(geometry, material),
      x, y, z,
      cluster: -1,
      visited: false
    };

    point.mesh.position.set(x, y, z);
    scene.add(point.mesh);
    points.push(point);
  }

  return points;
}
window.generatePoints = generatePoints;
```

## K-Means Algorithm
Implementation of K-Means clustering:

```javascript
function kMeans(points, k, scene) {
  // Initialize centroids
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const p = points[Math.floor(Math.random() * points.length)];
    const color = Math.random() * 0xffffff;
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshPhongMaterial({
      color, emissive: color, emissiveIntensity: 0.8
    });

    centroids.push({
      mesh: new THREE.Mesh(geometry, material),
      x: p.x, y: p.y, z: p.z,
      color, points: []
    });

    centroids[i].mesh.position.set(p.x, p.y, p.z);
    scene.add(centroids[i].mesh);
  }

  // Assign points to clusters
  points.forEach(p => {
    let minDist = Infinity, best = 0;
    centroids.forEach((c, i) => {
      const d = Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z);
      if (d < minDist) { minDist = d; best = i; }
    });

    p.cluster = best;
    p.mesh.material.color.setHex(centroids[best].color);
    p.mesh.material.emissive.setHex(centroids[best].color);
    centroids[best].points.push(p);
  });

  // Move centroids
  centroids.forEach(c => {
    if (c.points.length === 0) return;
    const ax = c.points.reduce((s, p) => s + p.x, 0) / c.points.length;
    const ay = c.points.reduce((s, p) => s + p.y, 0) / c.points.length;
    const az = c.points.reduce((s, p) => s + p.z, 0) / c.points.length;

    c.x += (ax - c.x) * 0.1;
    c.y += (ay - c.y) * 0.1;
    c.z += (az - c.z) * 0.1;
    c.mesh.position.set(c.x, c.y, c.z);
  });

  return centroids;
}
window.kMeans = kMeans;
```

## DBSCAN Algorithm
Implementation of density-based clustering:

```javascript
function dbscan(points, eps, minPts) {
  let clusterId = 0;

  points.forEach(p => {
    if (p.visited) return;
    p.visited = true;

    const neighbors = points.filter(q => {
      const d = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
      return d < eps && q !== p;
    });

    if (neighbors.length < minPts) {
      p.cluster = -1;
      p.mesh.material.color.setHex(0x888888);
      p.mesh.material.emissive.setHex(0x888888);
      return;
    }

    const color = Math.random() * 0xffffff;
    p.cluster = clusterId;
    p.mesh.material.color.setHex(color);
    p.mesh.material.emissive.setHex(color);

    const queue = [...neighbors];
    while (queue.length) {
      const q = queue.shift();
      if (q.visited) continue;
      q.visited = true;

      const qn = points.filter(r => {
        const d = Math.hypot(q.x - r.x, q.y - r.y, q.z - r.z);
        return d < eps && r !== q;
      });

      if (qn.length >= minPts) queue.push(...qn);
      if (q.cluster === -1) {
        q.cluster = clusterId;
        q.mesh.material.color.setHex(color);
        q.mesh.material.emissive.setHex(color);
      }
    }

    clusterId++;
  });
}
window.dbscan = dbscan;
```

## Scene Setup
Initialize the 3D scene:

```javascript
function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000a14);
  scene.fog = new THREE.Fog(0x000a14, 100, 500);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(80, 80, 80);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById(window.clusterConfig.canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x404040));
  const light = new THREE.PointLight(0x00ffff, 1, 400);
  light.position.set(0, 100, 0);
  scene.add(light);

  window.clusterScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initScene = initScene;
```

## Usage
Execute this DDI file to create a fully functional clustering visualization. All functions are automatically loaded into the global scope and can be called interactively.

---
*📦 All code blocks under 250 tokens | Executable documentation pattern*
