# 🏙️ Cyberpunk City DDI
*Document Driven Interface for procedural city generation*

## Overview
Generate a sprawling neon-lit cyberpunk metropolis with skyscrapers, flying vehicles, and holographic billboards. Pure procedural architecture!

## Configuration
City generation parameters:

```javascript
const config = {
  gridSize: 20,
  blockSize: 20,
  minHeight: 10,
  maxHeight: 80,
  buildingDensity: 0.7,
  vehicleCount: 20,
  neonIntensity: 0.8
};
window.cityConfig = config;
return config;
```

## Building Generator
Procedural skyscraper:

```javascript
function createBuilding(x, z, scene) {
  const cfg = window.cityConfig;

  if (Math.random() > cfg.buildingDensity) return null;

  const height = cfg.minHeight + Math.random() * (cfg.maxHeight - cfg.minHeight);
  const width = 5 + Math.random() * 10;
  const depth = 5 + Math.random() * 10;

  // Main structure
  const geom = new THREE.BoxGeometry(width, height, depth);
  const hue = Math.random() * 0.1 + 0.5; // Blue-purple range
  const color = new THREE.Color().setHSL(hue, 0.8, 0.3);
  const mat = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: cfg.neonIntensity * 0.3,
    flatShading: true
  });

  const building = new THREE.Mesh(geom, mat);
  building.position.set(x, height / 2, z);
  scene.add(building);

  // Add windows
  const windowCount = Math.floor(height / 3);
  for (let i = 0; i < windowCount; i++) {
    if (Math.random() < 0.7) {
      const windowGeom = new THREE.PlaneGeometry(width * 0.8, 2);
      const windowMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xffff00 : 0x00ffff,
        transparent: true,
        opacity: 0.8
      });
      const window = new THREE.Mesh(windowGeom, windowMat);
      window.position.set(x, i * 3 + 5, z + depth / 2 + 0.1);
      scene.add(window);
    }
  }

  // Top antenna
  if (Math.random() > 0.5) {
    const antennaGeom = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const antennaMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const antenna = new THREE.Mesh(antennaGeom, antennaMat);
    antenna.position.set(x, height + 5, z);
    scene.add(antenna);

    // Blinking light
    const lightGeom = new THREE.SphereGeometry(1, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true
    });
    const light = new THREE.Mesh(lightGeom, lightMat);
    light.position.set(x, height + 10, z);
    scene.add(light);
  }

  return { building, x, z, height, width, depth };
}
window.createBuilding = createBuilding;
```

## City Grid
Generate entire city:

```javascript
function generateCity(scene) {
  const cfg = window.cityConfig;
  const buildings = [];
  const halfGrid = cfg.gridSize / 2;

  for (let x = -halfGrid; x < halfGrid; x++) {
    for (let z = -halfGrid; z < halfGrid; z++) {
      const bx = x * cfg.blockSize;
      const bz = z * cfg.blockSize;

      // Leave streets
      if (x % 3 === 0 || z % 3 === 0) continue;

      const building = window.createBuilding(bx, bz, scene);
      if (building) buildings.push(building);
    }
  }

  console.log(`Generated ${buildings.length} buildings`);
  return buildings;
}
window.generateCity = generateCity;
```

## Flying Vehicle
Hover car with AI navigation:

```javascript
class FlyingVehicle {
  constructor(scene) {
    this.scene = scene;
    this.x = (Math.random() - 0.5) * 200;
    this.y = 20 + Math.random() * 40;
    this.z = (Math.random() - 0.5) * 200;
    this.speed = 0.5 + Math.random() * 0.5;
    this.direction = Math.random() * Math.PI * 2;

    // Create vehicle mesh
    const bodyGeom = new THREE.BoxGeometry(3, 1, 5);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5
    });
    this.mesh = new THREE.Mesh(bodyGeom, bodyMat);

    // Add lights
    const lightGeom = new THREE.SphereGeometry(0.3, 6, 6);
    const lightMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff
    });
    this.light1 = new THREE.Mesh(lightGeom, lightMat);
    this.light1.position.set(-1, 0, 2);
    this.mesh.add(this.light1);

    this.light2 = new THREE.Mesh(lightGeom, lightMat);
    this.light2.position.set(1, 0, 2);
    this.mesh.add(this.light2);

    this.mesh.position.set(this.x, this.y, this.z);
    scene.add(this.mesh);

    this.trail = [];
  }

  update() {
    // Move forward
    this.x += Math.cos(this.direction) * this.speed;
    this.z += Math.sin(this.direction) * this.speed;

    // Random direction changes
    if (Math.random() < 0.02) {
      this.direction += (Math.random() - 0.5) * 0.5;
    }

    // Wrap around city
    const cfg = window.cityConfig;
    const boundary = cfg.gridSize * cfg.blockSize / 2;
    if (Math.abs(this.x) > boundary) this.x = -this.x * 0.9;
    if (Math.abs(this.z) > boundary) this.z = -this.z * 0.9;

    // Update mesh
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = this.direction;

    // Add to trail
    this.trail.push({ x: this.x, y: this.y, z: this.z });
    if (this.trail.length > 30) this.trail.shift();
  }
}
window.FlyingVehicle = FlyingVehicle;
```

## Holographic Billboards
Animated advertisements:

```javascript
function createBillboard(x, y, z, scene) {
  const geom = new THREE.PlaneGeometry(15, 10);

  // Animated texture
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  const billboard = new THREE.Mesh(geom, mat);
  billboard.position.set(x, y, z);
  scene.add(billboard);

  // Animation function
  billboard.animate = function() {
    const time = Date.now() * 0.001;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 256, 256);

    // Draw animated text
    ctx.fillStyle = `hsl(${(time * 50) % 360}, 100%, 50%)`;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NEON CITY', 128, 128);

    // Draw scan lines
    for (let i = 0; i < 256; i += 4) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(0, i, 256, 2);
    }

    texture.needsUpdate = true;
  };

  return billboard;
}
window.createBillboard = createBillboard;
```

## Ground Effects
Wet pavement reflections:

```javascript
function createGround(scene) {
  const size = window.cityConfig.gridSize * window.cityConfig.blockSize;

  // Main ground
  const geom = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 100,
    reflectivity: 0.5
  });

  const ground = new THREE.Mesh(geom, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid lines (streets)
  const gridHelper = new THREE.GridHelper(size, window.cityConfig.gridSize, 0x00ffff, 0x003333);
  scene.add(gridHelper);

  return ground;
}
window.createGround = createGround;
```

## Scene Setup
Initialize cyberpunk environment:

```javascript
function initCityScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);
  scene.fog = new THREE.FogExp2(0x0a0a14, 0.003);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Lighting
  scene.add(new THREE.AmbientLight(0x222244));

  const light1 = new THREE.PointLight(0xff00ff, 2, 200);
  light1.position.set(50, 50, 50);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x00ffff, 2, 200);
  light2.position.set(-50, 50, -50);
  scene.add(light2);

  window.cityScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initCityScene = initCityScene;
```

## Execute
Generate cyberpunk city:

```javascript
const { scene, camera, renderer } = window.initCityScene();

// Create city
const ground = window.createGround(scene);
const buildings = window.generateCity(scene);

// Add flying vehicles
const vehicles = [];
for (let i = 0; i < window.cityConfig.vehicleCount; i++) {
  vehicles.push(new window.FlyingVehicle(scene));
}

// Add billboards
const billboards = [];
for (let i = 0; i < 5; i++) {
  const x = (Math.random() - 0.5) * 150;
  const z = (Math.random() - 0.5) * 150;
  billboards.push(window.createBillboard(x, 40, z, scene));
}

// Animation loop
function animate() {
  // Update vehicles
  vehicles.forEach(v => v.update());

  // Animate billboards
  billboards.forEach(b => b.animate());

  // Camera orbit
  const time = Date.now() * 0.00005;
  camera.position.x = Math.cos(time) * 120;
  camera.position.z = Math.sin(time) * 120;
  camera.position.y = 80 + Math.sin(time * 2) * 20;
  camera.lookAt(0, 20, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🏙️ Cyberpunk city generated! Flying vehicles active.');
```

## Usage
Explore the neon-lit metropolis! Procedurally generated buildings with glowing windows, flying vehicles navigating the skyways, and animated holographic billboards. Pure cyberpunk aesthetic!

---
*🏙️ Procedural architecture | Future noir cityscapes*
