# 🎭 GAN Training DDI
*Document Driven Interface for Generative Adversarial Networks*

## Overview
Visualize GAN training dynamics with Generator vs Discriminator competition. Watch the adversarial game unfold in 3D.

## Configuration
GAN hyperparameters:

```javascript
const config = {
  latentDim: 3,
  realDataPoints: 30,
  fakeDataPoints: 30,
  learningRate: 0.01,
  discriminatorSteps: 1,
  generatorSteps: 1,
  noiseScale: 10
};
window.ganConfig = config;
return config;
```

## Real Data Distribution
Target distribution for generator:

```javascript
function generateRealData(count, scene) {
  const points = [];

  for (let i = 0; i < count; i++) {
    // Gaussian mixture (two clusters)
    const cluster = Math.random() > 0.5 ? 1 : -1;
    const x = cluster * 20 + (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 8;
    const z = (Math.random() - 0.5) * 8;

    const geom = new THREE.SphereGeometry(1.5, 8, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.7
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    points.push({ x, y, z, mesh, real: true });
  }

  return points;
}
window.generateRealData = generateRealData;
```

## Generator Network
Creates fake samples from noise:

```javascript
class Generator {
  constructor() {
    this.weights = [];
    const cfg = window.ganConfig;

    // Simple linear transformation
    for (let i = 0; i < cfg.latentDim; i++) {
      this.weights[i] = {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5
      };
    }
  }

  generate(noise) {
    let x = 0, y = 0, z = 0;

    for (let i = 0; i < noise.length; i++) {
      x += noise[i] * this.weights[i].x;
      y += noise[i] * this.weights[i].y;
      z += noise[i] * this.weights[i].z;
    }

    return { x, y, z };
  }

  updateWeights(gradient, lr) {
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i].x += gradient.x * lr;
      this.weights[i].y += gradient.y * lr;
      this.weights[i].z += gradient.z * lr;
    }
  }
}
window.Generator = Generator;
```

## Discriminator Network
Classifies real vs fake:

```javascript
class Discriminator {
  constructor() {
    this.weights = {
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
      bias: Math.random() - 0.5
    };
  }

  predict(point) {
    const score = point.x * this.weights.x +
                  point.y * this.weights.y +
                  point.z * this.weights.z +
                  this.weights.bias;

    return 1 / (1 + Math.exp(-score)); // Sigmoid
  }

  updateWeights(gradient, lr) {
    this.weights.x += gradient.x * lr;
    this.weights.y += gradient.y * lr;
    this.weights.z += gradient.z * lr;
    this.weights.bias += gradient.bias * lr;
  }
}
window.Discriminator = Discriminator;
```

## Generate Fake Data
Create samples using generator:

```javascript
function generateFakeData(generator, count, scene) {
  const points = [];
  const cfg = window.ganConfig;

  for (let i = 0; i < count; i++) {
    // Random noise vector
    const noise = [];
    for (let j = 0; j < cfg.latentDim; j++) {
      noise[j] = (Math.random() - 0.5) * cfg.noiseScale;
    }

    const pos = generator.generate(noise);

    const geom = new THREE.SphereGeometry(1.5, 8, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.7
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, pos.y, pos.z);
    scene.add(mesh);

    points.push({ ...pos, mesh, real: false, noise });
  }

  return points;
}
window.generateFakeData = generateFakeData;
```

## Training Step
Update both networks:

```javascript
function trainGAN(generator, discriminator, realData, fakeData) {
  const lr = window.ganConfig.learningRate;

  // Train discriminator (maximize log D(x) + log(1-D(G(z))))
  let dLoss = 0;

  realData.forEach(point => {
    const pred = discriminator.predict(point);
    const error = 1 - pred; // Want to predict 1 for real
    dLoss += error * error;

    // Simplified gradient
    const grad = {
      x: error * point.x * 0.01,
      y: error * point.y * 0.01,
      z: error * point.z * 0.01,
      bias: error * 0.01
    };
    discriminator.updateWeights(grad, lr);
  });

  fakeData.forEach(point => {
    const pred = discriminator.predict(point);
    const error = pred; // Want to predict 0 for fake
    dLoss += error * error;

    const grad = {
      x: -error * point.x * 0.01,
      y: -error * point.y * 0.01,
      z: -error * point.z * 0.01,
      bias: -error * 0.01
    };
    discriminator.updateWeights(grad, lr);
  });

  // Train generator (maximize log D(G(z)))
  let gLoss = 0;

  fakeData.forEach(point => {
    const pred = discriminator.predict(point);
    const error = 1 - pred; // Want discriminator to predict 1
    gLoss += error * error;

    const grad = {
      x: error * 0.01,
      y: error * 0.01,
      z: error * 0.01
    };
    generator.updateWeights(grad, lr);
  });

  return { dLoss: dLoss / (realData.length + fakeData.length),
           gLoss: gLoss / fakeData.length };
}
window.trainGAN = trainGAN;
```

## Visualization Update
Show training progress:

```javascript
function updateGANViz(fakeData, generator) {
  fakeData.forEach((point, i) => {
    // Regenerate position
    const pos = generator.generate(point.noise);
    point.x = pos.x;
    point.y = pos.y;
    point.z = pos.z;

    // Update mesh
    point.mesh.position.set(pos.x, pos.y, pos.z);

    // Pulse effect
    const scale = 1 + Math.sin(Date.now() * 0.005 + i) * 0.2;
    point.mesh.scale.setScalar(scale);
  });
}
window.updateGANViz = updateGANViz;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initGANScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0014);
  scene.fog = new THREE.Fog(0x0a0014, 80, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(70, 50, 70);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x222222));
  const light1 = new THREE.PointLight(0x00ff00, 0.8, 200);
  light1.position.set(-30, 50, 0);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xff0000, 0.8, 200);
  light2.position.set(30, 50, 0);
  scene.add(light2);

  window.ganScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initGANScene = initGANScene;
```

## Execute
Run GAN training visualization:

```javascript
const { scene, camera, renderer } = window.initGANScene();

// Initialize networks
const generator = new window.Generator();
const discriminator = new window.Discriminator();

// Generate data
const realData = window.generateRealData(window.ganConfig.realDataPoints, scene);
let fakeData = window.generateFakeData(generator, window.ganConfig.fakeDataPoints, scene);

let iteration = 0;

// Animation loop
function animate() {
  // Training step
  if (iteration % 10 === 0) {
    const losses = window.trainGAN(generator, discriminator, realData, fakeData);
    window.updateGANViz(fakeData, generator);

    if (iteration % 100 === 0) {
      console.log(`Iter ${iteration}: D_loss=${losses.dLoss.toFixed(3)}, G_loss=${losses.gLoss.toFixed(3)}`);
    }
  }

  // Rotate camera
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 70;
  camera.position.z = Math.sin(time) * 70;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  iteration++;
  requestAnimationFrame(animate);
}
animate();

console.log('GAN training started! Green=real data, Red=generated (fake) data');
```

## Usage
Watch red (fake) points move toward green (real) distribution as generator learns! The adversarial game trains both networks simultaneously.

---
*🎭 Generative Adversarial Networks | The art of artificial creativity*
