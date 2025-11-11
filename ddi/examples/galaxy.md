# 🌌 Spiral Galaxy DDI
*Document Driven Interface for galactic structure simulation*

## Overview
Stunning spiral galaxy with rotating arms, star clusters, and nebula clouds. Watch millions of years of cosmic evolution in real-time!

## Configuration
Galaxy parameters:

```javascript
const config = {
  armCount: 4,
  starsPerArm: 2000,
  armRotationSpeed: 0.0001,
  armTightness: 0.8,
  coreRadius: 5,
  galaxyRadius: 60,
  starSizeVariation: 2
};
window.galaxyConfig = config;
return config;
```

## Star Class
Individual star with properties:

```javascript
class Star {
  constructor(position, size, color, scene) {
    this.position = position;
    this.size = size;
    this.baseColor = color;
    this.angle = Math.atan2(position.z, position.x);
    this.radius = Math.sqrt(position.x * position.x + position.z * position.z);

    const geometry = new THREE.SphereGeometry(size, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    // Add glow for bright stars
    if (size > 0.5) {
      const glowGeom = new THREE.SphereGeometry(size * 2, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      this.glow = new THREE.Mesh(glowGeom, glowMat);
      this.glow.position.copy(position);
      scene.add(this.glow);
    }
  }

  update(rotationDelta) {
    const cfg = window.galaxyConfig;

    // Differential rotation (inner faster than outer)
    const speed = 1 / (1 + this.radius * 0.02);
    this.angle += rotationDelta * speed;

    // Update position
    this.position.x = Math.cos(this.angle) * this.radius;
    this.position.z = Math.sin(this.angle) * this.radius;

    this.mesh.position.copy(this.position);
    if (this.glow) {
      this.glow.position.copy(this.position);

      // Pulse bright stars
      const pulse = Math.sin(Date.now() * 0.001) * 0.2 + 0.8;
      this.glow.scale.setScalar(pulse);
    }
  }
}
window.Star = Star;
```

## Spiral Arm Generator
Create galactic arms:

```javascript
function createSpiralArm(armIndex, scene) {
  const cfg = window.galaxyConfig;
  const stars = [];
  const starsPerArm = cfg.starsPerArm;
  const armAngleOffset = (armIndex * Math.PI * 2) / cfg.armCount;

  for (let i = 0; i < starsPerArm; i++) {
    const t = i / starsPerArm;
    const radius = cfg.coreRadius + t * (cfg.galaxyRadius - cfg.coreRadius);

    // Logarithmic spiral
    const angle = armAngleOffset + t * Math.PI * 2 * cfg.armTightness;

    // Add randomness
    const angleJitter = (Math.random() - 0.5) * 0.3;
    const radiusJitter = (Math.random() - 0.5) * 5;

    const x = Math.cos(angle + angleJitter) * (radius + radiusJitter);
    const y = (Math.random() - 0.5) * (3 + t * 5); // Disk thickness increases outward
    const z = Math.sin(angle + angleJitter) * (radius + radiusJitter);

    const position = new THREE.Vector3(x, y, z);

    // Star properties based on position
    const distanceFromCore = radius / cfg.galaxyRadius;
    const size = 0.2 + Math.random() * cfg.starSizeVariation * (1 - distanceFromCore * 0.5);

    // Color variation
    const hue = 0.1 + Math.random() * 0.2; // Yellow to orange
    const saturation = 0.3 + distanceFromCore * 0.4;
    const lightness = 0.5 + Math.random() * 0.3;
    const color = new THREE.Color().setHSL(hue, saturation, lightness);

    // Blue giants for some bright stars
    if (Math.random() < 0.05) {
      color.setHSL(0.6, 0.8, 0.6);
    }

    const star = new window.Star(position, size, color, scene);
    stars.push(star);
  }

  return stars;
}
window.createSpiralArm = createSpiralArm;
```

## Galactic Core
Bright central bulge:

```javascript
function createGalacticCore(scene) {
  const cfg = window.galaxyConfig;
  const coreStars = [];

  // Dense core
  for (let i = 0; i < 500; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = Math.random() * cfg.coreRadius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) * 0.3; // Flattened
    const z = r * Math.sin(phi) * Math.sin(theta);

    const position = new THREE.Vector3(x, y, z);
    const size = 0.3 + Math.random() * 0.5;
    const color = new THREE.Color().setHSL(0.1, 0.8, 0.7);

    const star = new window.Star(position, size, color, scene);
    coreStars.push(star);
  }

  // Central glow
  const glowGeom = new THREE.SphereGeometry(cfg.coreRadius * 1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffaa44,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  scene.add(glow);

  return { stars: coreStars, glow };
}
window.createGalacticCore = createGalacticCore;
```

## Nebula Clouds
Gas and dust regions:

```javascript
function createNebulae(scene) {
  const nebulae = [];

  for (let i = 0; i < 15; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 20 + Math.random() * 40;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = (Math.random() - 0.5) * 5;

    const size = 5 + Math.random() * 10;
    const geometry = new THREE.SphereGeometry(size, 16, 16);

    const hue = Math.random() * 0.3 + 0.5; // Blue-pink
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    const nebula = new THREE.Mesh(geometry, material);
    nebula.position.set(x, y, z);
    scene.add(nebula);

    nebulae.push({
      mesh: nebula,
      angle: theta,
      radius: r,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  return nebulae;
}
window.createNebulae = createNebulae;
```

## Background Stars
Distant field stars:

```javascript
function createBackground(scene) {
  const geometry = new THREE.BufferGeometry();
  const starCount = 5000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 150 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi);
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const brightness = 0.5 + Math.random() * 0.5;
    colors[i3] = brightness;
    colors[i3 + 1] = brightness;
    colors[i3 + 2] = brightness;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return stars;
}
window.createBackground = createBackground;
```

## Scene Setup
Initialize cosmic environment:

```javascript
function initGalaxyScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 80, 120);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  window.galaxyScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initGalaxyScene = initGalaxyScene;
```

## Execute
Run galaxy simulation:

```javascript
const { scene, camera, renderer } = window.initGalaxyScene();
const cfg = window.galaxyConfig;

// Create galaxy structure
const background = window.createBackground(scene);
const core = window.createGalacticCore(scene);
const nebulae = window.createNebulae(scene);

const arms = [];
for (let i = 0; i < cfg.armCount; i++) {
  arms.push(window.createSpiralArm(i, scene));
}

console.log(`🌌 Galaxy created with ${cfg.armCount} spiral arms`);

// Animation loop
function animate() {
  const rotationDelta = cfg.armRotationSpeed;

  // Rotate galaxy
  arms.forEach(arm => {
    arm.forEach(star => star.update(rotationDelta));
  });

  // Pulse core
  const pulse = Math.sin(Date.now() * 0.0005) * 0.2 + 1;
  core.glow.scale.setScalar(pulse);

  // Animate nebulae
  const time = Date.now() * 0.0001;
  nebulae.forEach(neb => {
    neb.angle += cfg.armRotationSpeed * 0.5;
    neb.mesh.position.x = Math.cos(neb.angle) * neb.radius;
    neb.mesh.position.z = Math.sin(neb.angle) * neb.radius;

    const opacity = 0.1 + Math.sin(time + neb.pulseOffset) * 0.05;
    neb.mesh.material.opacity = opacity;
  });

  // Rotate background slowly
  background.rotation.y += 0.0001;

  // Camera orbit
  const cameraTime = Date.now() * 0.00005;
  camera.position.x = Math.cos(cameraTime) * 120;
  camera.position.z = Math.sin(cameraTime) * 120;
  camera.position.y = 80 + Math.sin(cameraTime * 2) * 20;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

## Usage
Witness a spiral galaxy in motion! Thousands of stars rotate around the bright core. Spiral arms exhibit differential rotation (inner orbits faster). Nebula clouds glow in the arms. Pure cosmic beauty!

---
*🌌 Galactic dynamics | Billions of stars in elegant motion*
