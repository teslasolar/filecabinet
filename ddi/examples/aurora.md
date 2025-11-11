# 🌌 Aurora Borealis DDI
*Document Driven Interface for atmospheric light phenomena*

## Overview
Mesmerizing Northern Lights dancing across the night sky. Realistic aurora with flowing ribbons of colored light and particle effects.

## Configuration
Aurora parameters:

```javascript
const config = {
  ribbonCount: 8,
  particleCount: 2000,
  waveSpeed: 0.3,
  colorShift: 0.002,
  intensity: 0.8,
  flowSpeed: 0.01
};
window.auroraConfig = config;
return config;
```

## Ribbon Class
Flowing light curtain:

```javascript
class AuroraRibbon {
  constructor(scene, offset) {
    this.offset = offset;
    this.points = [];
    this.segments = 50;
    this.width = 200;
    this.baseHue = Math.random();

    // Create ribbon geometry
    const vertices = [];
    const colors = [];

    for (let i = 0; i < this.segments; i++) {
      const x = (i / this.segments - 0.5) * this.width;
      const y = 30 + Math.sin(i * 0.3) * 10;
      const z = -50 + Math.cos(i * 0.2) * 20;

      vertices.push(x, y, z);
      vertices.push(x, 0, z);

      const hue = (this.baseHue + i / this.segments * 0.3) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r * 0.5, color.g * 0.5, color.b * 0.5);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const indices = [];
    for (let i = 0; i < this.segments - 1; i++) {
      indices.push(i * 2, i * 2 + 1, i * 2 + 2);
      indices.push(i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    geometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update(time) {
    const cfg = window.auroraConfig;
    const positions = this.mesh.geometry.attributes.position.array;
    const colors = this.mesh.geometry.attributes.color.array;

    for (let i = 0; i < this.segments; i++) {
      const idx = i * 6;
      const t = time * cfg.waveSpeed + this.offset + i * 0.1;

      // Wave motion
      const wave1 = Math.sin(t) * 15;
      const wave2 = Math.cos(t * 1.5) * 8;
      const y = 30 + wave1 + wave2;

      positions[idx + 1] = y;

      // Shimmer colors
      const hue = (this.baseHue + time * cfg.colorShift + i / this.segments * 0.3) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5 + Math.sin(t * 2) * 0.2);

      const colorIdx = i * 6;
      colors[colorIdx] = color.r;
      colors[colorIdx + 1] = color.g;
      colors[colorIdx + 2] = color.b;
    }

    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.color.needsUpdate = true;
  }
}
window.AuroraRibbon = AuroraRibbon;
```

## Particle System
Glowing energy particles:

```javascript
class AuroraParticles {
  constructor(scene) {
    const cfg = window.auroraConfig;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(cfg.particleCount * 3);
    const colors = new Float32Array(cfg.particleCount * 3);
    const velocities = [];

    for (let i = 0; i < cfg.particleCount; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 100 - 50;

      const hue = Math.random() * 0.3 + 0.4; // Blue-green range
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.velocities = velocities;
    scene.add(this.particles);
  }

  update() {
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.velocities.length; i++) {
      const i3 = i * 3;
      const vel = this.velocities[i];

      positions[i3] += vel.x;
      positions[i3 + 1] += vel.y;
      positions[i3 + 2] += vel.z;

      // Wrap around
      if (positions[i3 + 1] > 60) {
        positions[i3 + 1] = 0;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 100 - 50;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
window.AuroraParticles = AuroraParticles;
```

## Starfield
Twinkling stars background:

```javascript
function createStars(scene) {
  const geometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi);
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    sizes[i] = Math.random() * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  // Twinkle animation
  stars.animate = function(time) {
    const sizes = this.geometry.attributes.size.array;
    for (let i = 0; i < sizes.length; i++) {
      sizes[i] = 0.5 + Math.sin(time * 2 + i) * 0.5;
    }
    this.geometry.attributes.size.needsUpdate = true;
  };

  return stars;
}
window.createStars = createStars;
```

## Ground/Mountains
Silhouette landscape:

```javascript
function createLandscape(scene) {
  const points = [];
  const segments = 100;

  for (let i = 0; i < segments; i++) {
    const x = (i / segments - 0.5) * 300;
    const noise1 = Math.sin(i * 0.3) * 15;
    const noise2 = Math.cos(i * 0.15) * 10;
    const y = noise1 + noise2 - 40;
    points.push(new THREE.Vector2(x, y));
  }

  const shape = new THREE.Shape(points);
  shape.lineTo(150, -100);
  shape.lineTo(-150, -100);

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
  });

  const landscape = new THREE.Mesh(geometry, material);
  landscape.position.z = -80;
  scene.add(landscape);

  return landscape;
}
window.createLandscape = createLandscape;
```

## Glow Effect
Atmospheric haze:

```javascript
function createAtmosphere(scene) {
  const geometry = new THREE.PlaneGeometry(300, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });

  const glow = new THREE.Mesh(geometry, material);
  glow.position.set(0, 30, -70);
  scene.add(glow);

  glow.animate = function(time) {
    this.material.opacity = 0.05 + Math.sin(time * 0.5) * 0.05;
  };

  return glow;
}
window.createAtmosphere = createAtmosphere;
```

## Scene Setup
Initialize aurora environment:

```javascript
function initAuroraScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000510);
  scene.fog = new THREE.Fog(0x000510, 100, 400);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 10, 80);
  camera.lookAt(0, 20, -50);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  window.auroraScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initAuroraScene = initAuroraScene;
```

## Execute
Run aurora borealis simulation:

```javascript
const { scene, camera, renderer } = window.initAuroraScene();
const cfg = window.auroraConfig;

// Create scene elements
const ribbons = [];
for (let i = 0; i < cfg.ribbonCount; i++) {
  ribbons.push(new window.AuroraRibbon(scene, i * Math.PI / 4));
}

const particles = new window.AuroraParticles(scene);
const stars = window.createStars(scene);
const landscape = window.createLandscape(scene);
const atmosphere = window.createAtmosphere(scene);

let time = 0;

// Animation loop
function animate() {
  time += 0.016;

  // Update aurora
  ribbons.forEach(ribbon => ribbon.update(time));
  particles.update();
  stars.animate(time);
  atmosphere.animate(time);

  // Gentle camera sway
  camera.position.x = Math.sin(time * 0.1) * 5;
  camera.lookAt(0, 20, -50);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🌌 Aurora Borealis active! Watch the dancing lights...');
```

## Usage
Experience the Northern Lights! Flowing ribbons of green and blue light shimmer across the sky. Particles float upward through the aurora. Stars twinkle in the background. Pure atmospheric magic!

---
*🌌 Natural phenomenon simulation | The magic of the polar skies*
