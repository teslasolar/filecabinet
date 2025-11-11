# 🧠 Neural Network Training DDI
*Document Driven Interface for backpropagation visualization*

## Overview
Interactive neural network with forward and backward passes. Watch weights update in real-time through 3D visualization.

## Configuration
Network architecture and training parameters:

```javascript
const config = {
  layers: [4, 8, 6, 3],
  learningRate: 0.1,
  activationSpeed: 0.05,
  nodeSize: 3,
  spacing: 20
};
window.nnConfig = config;
return config;
```

## Network Initialization
Create neurons and connections:

```javascript
function initNetwork(layers, scene) {
  const neurons = [];
  const connections = [];

  layers.forEach((count, layerIdx) => {
    const x = (layerIdx - layers.length / 2) * window.nnConfig.spacing;

    for (let i = 0; i < count; i++) {
      const y = (i - count / 2) * 10;
      const z = (Math.random() - 0.5) * 5;

      const geom = new THREE.SphereGeometry(window.nnConfig.nodeSize, 8, 8);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);

      neurons.push({
        mesh,
        layer: layerIdx,
        activation: 0,
        bias: Math.random() - 0.5,
        weights: []
      });
    }
  });

  window.nnNeurons = neurons;
  return neurons;
}
window.initNetwork = initNetwork;
```

## Create Connections
Build weighted edges between layers:

```javascript
function createConnections(neurons, scene) {
  const connections = [];
  const layers = window.nnConfig.layers;
  let nIdx = 0;

  for (let l = 0; l < layers.length - 1; l++) {
    const currLayer = neurons.slice(nIdx, nIdx + layers[l]);
    const nextLayer = neurons.slice(nIdx + layers[l], nIdx + layers[l] + layers[l + 1]);

    currLayer.forEach(n1 => {
      nextLayer.forEach(n2 => {
        const weight = Math.random() - 0.5;
        n1.weights.push(weight);

        const points = [n1.mesh.position, n2.mesh.position];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: weight > 0 ? 0x00ff00 : 0xff0000,
          opacity: Math.abs(weight),
          transparent: true
        });

        const line = new THREE.Line(geom, mat);
        scene.add(line);
        connections.push({ line, weight, from: n1, to: n2 });
      });
    });

    nIdx += layers[l];
  }

  window.nnConnections = connections;
  return connections;
}
window.createConnections = createConnections;
```

## Forward Pass
Propagate activations through network:

```javascript
function forwardPass(neurons) {
  const layers = window.nnConfig.layers;
  let nIdx = 0;

  // Random input
  for (let i = 0; i < layers[0]; i++) {
    neurons[i].activation = Math.random();
  }

  // Propagate
  for (let l = 0; l < layers.length - 1; l++) {
    const nextStart = nIdx + layers[l];
    const nextEnd = nextStart + layers[l + 1];

    for (let i = nextStart; i < nextEnd; i++) {
      let sum = neurons[i].bias;
      let wIdx = 0;

      for (let j = nIdx; j < nIdx + layers[l]; j++) {
        sum += neurons[j].activation * neurons[j].weights[wIdx++];
      }

      neurons[i].activation = 1 / (1 + Math.exp(-sum)); // Sigmoid
    }

    nIdx += layers[l];
  }

  // Visualize
  neurons.forEach(n => {
    const intensity = n.activation;
    n.mesh.material.emissiveIntensity = intensity;
    n.mesh.scale.setScalar(1 + intensity * 0.5);
  });
}
window.forwardPass = forwardPass;
```

## Backward Pass
Update weights using gradient descent:

```javascript
function backwardPass(neurons, connections) {
  const lr = window.nnConfig.learningRate;
  const layers = window.nnConfig.layers;

  // Calculate gradients (simplified)
  neurons.forEach(n => {
    n.gradient = (Math.random() - 0.5) * 0.1;
  });

  // Update weights
  connections.forEach(conn => {
    const gradient = conn.from.activation * conn.to.gradient;
    conn.weight -= lr * gradient;

    // Update visualization
    conn.line.material.color.setHex(conn.weight > 0 ? 0x00ff00 : 0xff0000);
    conn.line.material.opacity = Math.min(Math.abs(conn.weight), 1);
  });

  // Update neuron biases
  neurons.forEach(n => {
    n.bias -= lr * n.gradient;
  });
}
window.backwardPass = backwardPass;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initNNScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000510);
  scene.fog = new THREE.Fog(0x000510, 50, 200);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(60, 30, 60);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x222222));
  const light = new THREE.PointLight(0x00ffff, 1, 300);
  light.position.set(0, 50, 50);
  scene.add(light);

  window.nnScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initNNScene = initNNScene;
```

## Animation Loop
Continuous training visualization:

```javascript
function animateNN() {
  if (!window.nnScene || !window.nnNeurons) return;

  const { scene, camera, renderer } = window.nnScene;

  // Training step
  if (Math.random() < 0.1) {
    window.forwardPass(window.nnNeurons);
    window.backwardPass(window.nnNeurons, window.nnConnections);
  }

  // Rotate camera
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 60;
  camera.position.z = Math.sin(time) * 60;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animateNN);
}

// Start animation
const { scene } = window.initNNScene();
window.initNetwork(window.nnConfig.layers, scene);
window.createConnections(window.nnNeurons, scene);
requestAnimationFrame(animateNN);
```

## Usage
Run all blocks to see neural network training in 3D. Neurons pulse with activation, connections show weight strength (green=positive, red=negative).

---
*📦 All code blocks under 250 tokens | Self-documenting AI visualization*
