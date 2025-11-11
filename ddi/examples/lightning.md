# ⚡ Lightning Storm DDI
*Document Driven Interface for electrical discharge simulation*

## Overview
Dramatic lightning storm with branching bolts, thunder clouds, and electrical arcs. Procedurally generated fractal lightning strikes!

## Configuration
Storm parameters:

```javascript
const config = {
  strikesPerMinute: 20,
  branchProbability: 0.4,
  maxBranches: 5,
  segmentLength: 3,
  jitterAmount: 2,
  fadeSpeed: 0.95,
  flashIntensity: 3
};
window.stormConfig = config;
return config;
```

## Lightning Bolt Class
Fractal electrical discharge:

```javascript
class LightningBolt {
  constructor(start, end, scene, generation = 0) {
    this.start = start.clone();
    this.end = end.clone();
    this.scene = scene;
    this.generation = generation;
    this.life = 1.0;
    this.branches = [];
    this.segments = [];

    this.generate();
    this.createMesh();
  }

  generate() {
    const cfg = window.stormConfig;
    const direction = new THREE.Vector3().subVectors(this.end, this.start);
    const distance = direction.length();
    const steps = Math.floor(distance / cfg.segmentLength);

    this.points = [this.start.clone()];

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const point = new THREE.Vector3().lerpVectors(this.start, this.end, t);

      // Add jitter
      point.x += (Math.random() - 0.5) * cfg.jitterAmount;
      point.z += (Math.random() - 0.5) * cfg.jitterAmount;

      this.points.push(point);

      // Create branch?
      if (Math.random() < cfg.branchProbability && this.generation < cfg.maxBranches) {
        const branchEnd = point.clone();
        branchEnd.x += (Math.random() - 0.5) * 20;
        branchEnd.y -= Math.random() * 30;
        branchEnd.z += (Math.random() - 0.5) * 20;

        const branch = new LightningBolt(point, branchEnd, scene, this.generation + 1);
        this.branches.push(branch);
      }
    }

    this.points.push(this.end.clone());
  }

  createMesh() {
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    const material = new THREE.LineBasicMaterial({
      color: 0xaaddff,
      linewidth: 3,
      transparent: true,
      opacity: 1
    });

    this.line = new THREE.Line(geometry, material);
    this.scene.add(this.line);

    // Glow effect
    const glowMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    this.glow = new THREE.Line(geometry.clone(), glowMat);
    this.scene.add(this.glow);
  }

  update() {
    const cfg = window.stormConfig;
    this.life *= cfg.fadeSpeed;

    if (this.line) {
      this.line.material.opacity = this.life;
      this.glow.material.opacity = this.life * 0.5;
    }

    this.branches.forEach(branch => branch.update());

    return this.life > 0.1;
  }

  remove() {
    if (this.line) {
      this.scene.remove(this.line);
      this.scene.remove(this.glow);
    }
    this.branches.forEach(branch => branch.remove());
  }
}
window.LightningBolt = LightningBolt;
```

## Thunder Clouds
Dark storm clouds:

```javascript
function createClouds(scene) {
  const clouds = [];

  for (let i = 0; i < 8; i++) {
    const geometry = new THREE.SphereGeometry(15 + Math.random() * 10, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x222233,
      transparent: true,
      opacity: 0.8
    });

    const cloud = new THREE.Mesh(geometry, material);
    cloud.position.set(
      (Math.random() - 0.5) * 100,
      60 + Math.random() * 20,
      -50 + (Math.random() - 0.5) * 50
    );
    cloud.scale.set(1, 0.6, 1);
    scene.add(cloud);
    clouds.push(cloud);
  }

  return clouds;
}
window.createClouds = createClouds;
```

## Lightning Strike System
Manages bolt generation:

```javascript
class StormSystem {
  constructor(scene) {
    this.scene = scene;
    this.bolts = [];
    this.lastStrike = Date.now();
    this.flashLight = null;

    // Create flash light
    this.flashLight = new THREE.PointLight(0xaaddff, 0, 300);
    this.flashLight.position.set(0, 50, 0);
    scene.add(this.flashLight);
  }

  createStrike() {
    const start = new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      50 + Math.random() * 20,
      -40 + (Math.random() - 0.5) * 30
    );

    const end = new THREE.Vector3(
      start.x + (Math.random() - 0.5) * 20,
      -50,
      start.z + (Math.random() - 0.5) * 20
    );

    const bolt = new window.LightningBolt(start, end, this.scene);
    this.bolts.push(bolt);

    // Flash effect
    this.flashLight.intensity = window.stormConfig.flashIntensity;
    this.flashLight.position.copy(start);

    console.log(`⚡ Lightning strike at (${start.x.toFixed(0)}, ${start.z.toFixed(0)})`);
  }

  update() {
    const cfg = window.stormConfig;
    const now = Date.now();
    const interval = 60000 / cfg.strikesPerMinute;

    // Random strike?
    if (now - this.lastStrike > interval && Math.random() < 0.3) {
      this.createStrike();
      this.lastStrike = now;
    }

    // Update bolts
    this.bolts = this.bolts.filter(bolt => bolt.update());

    // Fade flash
    if (this.flashLight.intensity > 0) {
      this.flashLight.intensity *= 0.9;
    }
  }
}
window.StormSystem = StormSystem;
```

## Ground Plane
Rain-soaked ground:

```javascript
function createGround(scene) {
  const geometry = new THREE.PlaneGeometry(200, 200);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0a0a1a,
    shininess: 100,
    reflectivity: 0.3
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -50;
  ground.receiveShadow = true;
  scene.add(ground);

  return ground;
}
window.createGround = createGround;
```

## Rain Effect
Falling rain particles:

```javascript
class RainSystem {
  constructor(scene) {
    const rainCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = [];

    for (let i = 0; i < rainCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 150 - 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      velocities.push(2 + Math.random() * 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x88aaff,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });

    this.rain = new THREE.Points(geometry, material);
    this.velocities = velocities;
    scene.add(this.rain);
  }

  update() {
    const positions = this.rain.geometry.attributes.position.array;

    for (let i = 0; i < this.velocities.length; i++) {
      const i3 = i * 3;
      positions[i3 + 1] -= this.velocities[i];

      // Reset if hit ground
      if (positions[i3 + 1] < -50) {
        positions[i3 + 1] = 100;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 200;
      }
    }

    this.rain.geometry.attributes.position.needsUpdate = true;
  }
}
window.RainSystem = RainSystem;
```

## Scene Setup
Initialize storm environment:

```javascript
function initStormScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);
  scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 10, 80);
  camera.lookAt(0, 0, -20);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Ambient lightning
  scene.add(new THREE.AmbientLight(0x111122));

  window.stormScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initStormScene = initStormScene;
```

## Execute
Run lightning storm:

```javascript
const { scene, camera, renderer } = window.initStormScene();

// Create storm elements
const ground = window.createGround(scene);
const clouds = window.createClouds(scene);
const storm = new window.StormSystem(scene);
const rain = new window.RainSystem(scene);

// Animate clouds
clouds.forEach((cloud, i) => {
  cloud.userData.offset = i * Math.PI / 4;
});

// Animation loop
function animate() {
  // Update storm
  storm.update();
  rain.update();

  // Animate clouds
  const time = Date.now() * 0.0001;
  clouds.forEach(cloud => {
    cloud.position.x += Math.sin(time + cloud.userData.offset) * 0.05;
    cloud.material.opacity = 0.6 + Math.sin(time * 2 + cloud.userData.offset) * 0.2;
  });

  // Camera sway
  camera.position.x = Math.sin(time * 0.5) * 10;
  camera.lookAt(0, 0, -20);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('⚡ Storm brewing! Lightning strikes incoming...');
```

## Usage
Experience a dramatic thunderstorm! Lightning bolts branch fractally from clouds to ground. Rain pours down. The sky flashes with each strike. Modify `config.strikesPerMinute` to control storm intensity!

---
*⚡ Electrical phenomena | Nature's raw power visualized*
