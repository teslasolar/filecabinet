# 🌊 Wave Physics DDI
*Document Driven Interface for fluid dynamics and wave simulation*

## Overview
Simulate realistic water waves with physics-based height fields. Watch ripples propagate and interfere in real-time 3D.

## Configuration
Wave simulation parameters:

```javascript
const config = {
  gridSize: 64,
  cellSize: 2,
  damping: 0.99,
  speed: 0.8,
  dropForce: 50,
  autoDrops: true
};
window.waveConfig = config;
return config;
```

## Wave Grid
Height field data structure:

```javascript
class WaveGrid {
  constructor(size) {
    this.size = size;
    this.current = new Array(size * size).fill(0);
    this.previous = new Array(size * size).fill(0);
  }

  idx(x, y) {
    return y * this.size + x;
  }

  get(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return 0;
    return this.current[this.idx(x, y)];
  }

  set(x, y, value) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
    this.current[this.idx(x, y)] = value;
  }

  swap() {
    const temp = this.previous;
    this.previous = this.current;
    this.current = temp;
  }
}
window.WaveGrid = WaveGrid;
```

## Wave Physics
2D wave equation solver:

```javascript
function updateWaves(grid, damping, speed) {
  grid.swap();
  const size = grid.size;

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      // Wave equation: ∂²h/∂t² = c²∇²h
      const left = grid.previous[grid.idx(x - 1, y)];
      const right = grid.previous[grid.idx(x + 1, y)];
      const up = grid.previous[grid.idx(x, y - 1)];
      const down = grid.previous[grid.idx(x, y + 1)];
      const center = grid.previous[grid.idx(x, y)];

      const laplacian = (left + right + up + down) / 4 - center;
      const newHeight = center + laplacian * speed * speed;

      // Time integration with damping
      const oldOld = grid.current[grid.idx(x, y)];
      grid.current[grid.idx(x, y)] = newHeight * 2 - oldOld;
      grid.current[grid.idx(x, y)] *= damping;
    }
  }
}
window.updateWaves = updateWaves;
```

## Water Drop
Create disturbance in grid:

```javascript
function createDrop(grid, x, y, force) {
  const size = grid.size;
  const radius = 3;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const gx = x + dx;
      const gy = y + dy;

      if (gx >= 0 && gx < size && gy >= 0 && gy < size) {
        const falloff = 1 - dist / radius;
        const idx = grid.idx(gx, gy);
        grid.current[idx] += force * falloff;
      }
    }
  }
}
window.createDrop = createDrop;
```

## Mesh Generation
Create 3D surface from height field:

```javascript
function createWaveMesh(grid, cellSize, scene) {
  const size = grid.size;
  const geometry = new THREE.PlaneGeometry(
    size * cellSize,
    size * cellSize,
    size - 1,
    size - 1
  );

  const vertices = geometry.attributes.position.array;

  // Create gradient material
  const material = new THREE.MeshPhongMaterial({
    color: 0x0088ff,
    emissive: 0x003366,
    shininess: 100,
    flatShading: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  return { mesh, geometry, vertices };
}
window.createWaveMesh = createWaveMesh;
```

## Update Visualization
Apply heights to mesh vertices:

```javascript
function updateWaveMesh(grid, meshData, cellSize) {
  const { geometry, vertices } = meshData;
  const size = grid.size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3;
      const height = grid.current[grid.idx(x, y)];

      // Update Y coordinate (height)
      vertices[idx + 2] = height;

      // Color based on height
      const hue = 0.55 + height * 0.01;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      geometry.attributes.position.array[idx + 2] = height;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}
window.updateWaveMesh = updateWaveMesh;
```

## Auto Drop System
Random water drops:

```javascript
class DropSystem {
  constructor(grid) {
    this.grid = grid;
    this.interval = 30;
    this.counter = 0;
  }

  update() {
    if (!window.waveConfig.autoDrops) return;

    this.counter++;
    if (this.counter >= this.interval) {
      this.counter = 0;

      const x = Math.floor(Math.random() * this.grid.size);
      const y = Math.floor(Math.random() * this.grid.size);
      const force = window.waveConfig.dropForce * (0.5 + Math.random() * 0.5);

      window.createDrop(this.grid, x, y, force);
    }
  }
}
window.DropSystem = DropSystem;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initWaveScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001a33);
  scene.fog = new THREE.Fog(0x001a33, 50, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(80, 80, 80);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Lighting
  scene.add(new THREE.AmbientLight(0x404040));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(50, 100, 50);
  scene.add(sun);

  const light = new THREE.PointLight(0x0088ff, 1, 300);
  light.position.set(0, 50, 0);
  scene.add(light);

  window.waveScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initWaveScene = initWaveScene;
```

## Execute
Run wave simulation:

```javascript
const { scene, camera, renderer } = window.initWaveScene();
const cfg = window.waveConfig;

// Create wave grid
const grid = new window.WaveGrid(cfg.gridSize);
const meshData = window.createWaveMesh(grid, cfg.cellSize, scene);
const dropSystem = new window.DropSystem(grid);

// Initial drops
window.createDrop(grid, 20, 20, 100);
window.createDrop(grid, 40, 40, 80);

let frame = 0;

// Animation loop
function animate() {
  frame++;

  // Physics update
  window.updateWaves(grid, cfg.damping, cfg.speed);
  dropSystem.update();

  // Visual update
  window.updateWaveMesh(grid, meshData, cfg.cellSize);

  // Camera orbit
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 100;
  camera.position.z = Math.sin(time) * 100;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🌊 Wave simulation running! Watch the ripples propagate...');
```

## Usage
Watch realistic wave physics! Drops create ripples that propagate and interfere. Try clicking to add manual drops or modify `config.autoDrops = false` to stop automatic drops.

---
*🌊 Real-time fluid dynamics | Physics-based wave simulation*
