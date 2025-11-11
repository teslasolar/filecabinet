# ⚡ Particle Swarm Optimization DDI
*Document Driven Interface for swarm intelligence algorithms*

## Overview
Particle Swarm Optimization (PSO) finds optimal solutions using collective behavior. Watch particles search for the global optimum.

## Configuration
Swarm parameters:

```javascript
const config = {
  particleCount: 50,
  dimensions: 3,
  inertia: 0.7,
  cognitive: 1.5,
  social: 1.5,
  maxVelocity: 5,
  searchSpace: 50
};
window.psoConfig = config;
return config;
```

## Fitness Function
Rastrigin function (multimodal optimization):

```javascript
function fitnessFunction(position) {
  const A = 10;
  const n = position.length;

  let sum = A * n;
  for (let i = 0; i < n; i++) {
    const xi = position[i];
    sum += xi * xi - A * Math.cos(2 * Math.PI * xi);
  }

  return -sum; // Negative because we maximize
}
window.fitnessFunction = fitnessFunction;
```

## Particle Class
Individual agent with position and velocity:

```javascript
class Particle {
  constructor(scene) {
    this.position = [];
    this.velocity = [];
    this.bestPosition = [];
    this.bestFitness = -Infinity;

    const cfg = window.psoConfig;

    // Random initialization
    for (let i = 0; i < cfg.dimensions; i++) {
      this.position[i] = (Math.random() - 0.5) * cfg.searchSpace;
      this.velocity[i] = (Math.random() - 0.5) * cfg.maxVelocity;
      this.bestPosition[i] = this.position[i];
    }

    // Visual representation
    const geom = new THREE.SphereGeometry(1, 8, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.6
    });
    this.mesh = new THREE.Mesh(geom, mat);
    scene.add(this.mesh);

    // Trail
    this.trail = [];
    this.updateMesh();
  }

  updateMesh() {
    if (this.position.length >= 3) {
      this.mesh.position.set(
        this.position[0],
        this.position[1],
        this.position[2]
      );
    }
  }

  evaluate() {
    const fitness = window.fitnessFunction(this.position);
    if (fitness > this.bestFitness) {
      this.bestFitness = fitness;
      this.bestPosition = [...this.position];
    }
    return fitness;
  }
}
window.Particle = Particle;
```

## Swarm Class
Collective optimization system:

```javascript
class Swarm {
  constructor(scene) {
    this.particles = [];
    this.globalBestPosition = [];
    this.globalBestFitness = -Infinity;
    this.scene = scene;
    this.iteration = 0;

    // Create particles
    for (let i = 0; i < window.psoConfig.particleCount; i++) {
      this.particles.push(new window.Particle(scene));
    }

    // Create global best marker
    const geom = new THREE.SphereGeometry(3, 16, 16);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.9
    });
    this.globalMesh = new THREE.Mesh(geom, mat);
    scene.add(this.globalMesh);
  }

  step() {
    const cfg = window.psoConfig;

    // Evaluate all particles
    this.particles.forEach(p => {
      const fitness = p.evaluate();

      if (fitness > this.globalBestFitness) {
        this.globalBestFitness = fitness;
        this.globalBestPosition = [...p.position];
      }
    });

    // Update velocities and positions
    this.particles.forEach(p => {
      for (let i = 0; i < cfg.dimensions; i++) {
        const r1 = Math.random();
        const r2 = Math.random();

        const cognitive = cfg.cognitive * r1 * (p.bestPosition[i] - p.position[i]);
        const social = cfg.social * r2 * (this.globalBestPosition[i] - p.position[i]);

        p.velocity[i] = cfg.inertia * p.velocity[i] + cognitive + social;

        // Clamp velocity
        p.velocity[i] = Math.max(-cfg.maxVelocity, Math.min(cfg.maxVelocity, p.velocity[i]));

        p.position[i] += p.velocity[i];
      }

      p.updateMesh();
    });

    // Update global best marker
    if (this.globalBestPosition.length >= 3) {
      this.globalMesh.position.set(
        this.globalBestPosition[0],
        this.globalBestPosition[1],
        this.globalBestPosition[2]
      );
    }

    this.iteration++;
  }
}
window.Swarm = Swarm;
```

## Visualization
Color particles by fitness:

```javascript
function visualizeSwarm(swarm) {
  const fitnesses = swarm.particles.map(p => p.bestFitness);
  const minFit = Math.min(...fitnesses);
  const maxFit = Math.max(...fitnesses);
  const range = maxFit - minFit || 1;

  swarm.particles.forEach(p => {
    const normalized = (p.bestFitness - minFit) / range;

    // Color gradient: red (bad) -> yellow -> green (good)
    const hue = normalized * 0.3; // 0 = red, 0.3 = green
    const color = new THREE.Color().setHSL(hue, 1, 0.5);

    p.mesh.material.color.copy(color);
    p.mesh.material.emissive.copy(color);
    p.mesh.scale.setScalar(1 + normalized * 0.5);
  });

  // Pulse global best
  const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
  swarm.globalMesh.scale.setScalar(1 + pulse);
}
window.visualizeSwarm = visualizeSwarm;
```

## Fitness Landscape
Show optimization surface:

```javascript
function createLandscape(scene) {
  const size = 50;
  const resolution = 20;
  const step = size / resolution;

  for (let x = -size / 2; x < size / 2; x += step) {
    for (let z = -size / 2; z < size / 2; z += step) {
      const fitness = window.fitnessFunction([x, 0, z]);
      const y = fitness * 0.1; // Scale for visibility

      const geom = new THREE.BoxGeometry(step * 0.8, 1, step * 0.8);
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((fitness + 300) / 600, 0.7, 0.4),
        transparent: true,
        opacity: 0.3
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
    }
  }
}
window.createLandscape = createLandscape;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initPSOScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000814);
  scene.fog = new THREE.Fog(0x000814, 80, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(80, 80, 80);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x333333));
  const light = new THREE.PointLight(0xffffff, 1, 400);
  light.position.set(0, 100, 0);
  scene.add(light);

  window.psoScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initPSOScene = initPSOScene;
```

## Execute
Run particle swarm optimization:

```javascript
const { scene, camera, renderer } = window.initPSOScene();

// Create landscape
window.createLandscape(scene);

// Initialize swarm
const swarm = new window.Swarm(scene);
window.psoSwarm = swarm;

// Animation loop
function animate() {
  // Optimization step
  swarm.step();
  window.visualizeSwarm(swarm);

  // Rotate camera
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 80;
  camera.position.z = Math.sin(time) * 80;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);

  // Log progress
  if (swarm.iteration % 50 === 0) {
    console.log(`Iteration ${swarm.iteration}: Best fitness = ${swarm.globalBestFitness.toFixed(2)}`);
  }

  requestAnimationFrame(animate);
}
animate();
```

## Usage
Watch particles converge on the global optimum! Yellow sphere marks the best solution found. Particle colors show fitness (red=poor, green=excellent).

---
*⚡ Swarm intelligence in action | Nature-inspired optimization*
