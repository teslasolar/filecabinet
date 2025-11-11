# 🎆 Fireworks DDI
*Document Driven Interface for particle systems and procedural explosions*

## Overview
Spectacular fireworks display with physics-based particles, trails, and colors. Watch explosions light up the night sky!

## Configuration
Fireworks parameters:

```javascript
const config = {
  launchInterval: 1000,
  gravity: -0.05,
  particlesPerBurst: 80,
  trailLength: 20,
  fadeSpeed: 0.98,
  explosionRadius: 30
};
window.fireworksConfig = config;
return config;
```

## Particle Class
Individual spark with physics:

```javascript
class Particle {
  constructor(x, y, z, vx, vy, vz, color, scene) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.color = color;
    this.life = 1.0;
    this.trail = [];

    // Create visual
    const geom = new THREE.SphereGeometry(0.5, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.position.set(x, y, z);
    scene.add(this.mesh);
  }

  update() {
    const cfg = window.fireworksConfig;

    // Physics
    this.vy += cfg.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    // Drag
    this.vx *= 0.99;
    this.vz *= 0.99;

    // Update mesh
    this.mesh.position.set(this.x, this.y, this.z);

    // Life decay
    this.life *= cfg.fadeSpeed;
    this.mesh.material.opacity = this.life;

    // Trail
    this.trail.push({ x: this.x, y: this.y, z: this.z, life: this.life });
    if (this.trail.length > cfg.trailLength) {
      this.trail.shift();
    }

    return this.life > 0.1;
  }

  remove(scene) {
    scene.remove(this.mesh);
  }
}
window.Particle = Particle;
```

## Firework Class
Rocket that explodes:

```javascript
class Firework {
  constructor(scene) {
    this.scene = scene;
    this.x = (Math.random() - 0.5) * 100;
    this.y = 0;
    this.z = (Math.random() - 0.5) * 100;
    this.targetY = 50 + Math.random() * 50;
    this.color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
    this.exploded = false;
    this.particles = [];

    // Create rocket
    const geom = new THREE.ConeGeometry(1, 3, 8);
    const mat = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.position.set(this.x, this.y, this.z);
    scene.add(this.mesh);

    // Launch velocity
    this.vy = 2;
  }

  update() {
    if (!this.exploded) {
      // Ascent
      this.y += this.vy;
      this.vy -= 0.02;
      this.mesh.position.y = this.y;

      // Check explosion height
      if (this.y >= this.targetY || this.vy < 0) {
        this.explode();
      }

      return true;
    } else {
      // Update particles
      this.particles = this.particles.filter(p => p.update());

      // All particles dead?
      return this.particles.length > 0;
    }
  }

  explode() {
    this.exploded = true;
    this.scene.remove(this.mesh);

    const cfg = window.fireworksConfig;
    const count = cfg.particlesPerBurst;

    // Create explosion pattern
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 1.5;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      // Vary colors slightly
      const hue = (this.color.getHSL({}).h + (Math.random() - 0.5) * 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);

      const particle = new window.Particle(
        this.x, this.y, this.z,
        vx, vy, vz,
        color,
        this.scene
      );

      this.particles.push(particle);
    }
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.particles.forEach(p => p.remove(this.scene));
  }
}
window.Firework = Firework;
```

## Burst Patterns
Special explosion shapes:

```javascript
function createBurstPattern(type, x, y, z, color, scene) {
  const particles = [];
  const cfg = window.fireworksConfig;

  switch(type) {
    case 'sphere':
      // Standard spherical burst
      for (let i = 0; i < cfg.particlesPerBurst; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 1 + Math.random() * 0.5;

        const vx = Math.sin(phi) * Math.cos(theta) * speed;
        const vy = Math.cos(phi) * speed;
        const vz = Math.sin(phi) * Math.sin(theta) * speed;

        particles.push(new window.Particle(x, y, z, vx, vy, vz, color, scene));
      }
      break;

    case 'ring':
      // Flat ring expansion
      for (let i = 0; i < cfg.particlesPerBurst; i++) {
        const angle = (i / cfg.particlesPerBurst) * Math.PI * 2;
        const speed = 1.2;

        const vx = Math.cos(angle) * speed;
        const vy = 0.2;
        const vz = Math.sin(angle) * speed;

        particles.push(new window.Particle(x, y, z, vx, vy, vz, color, scene));
      }
      break;

    case 'heart':
      // Heart shape
      for (let i = 0; i < cfg.particlesPerBurst; i++) {
        const t = (i / cfg.particlesPerBurst) * Math.PI * 2;
        const heartX = Math.sin(t) * Math.cos(t) * Math.log(Math.abs(t));
        const heartY = Math.sqrt(Math.abs(t)) * Math.cos(t);

        const speed = 0.8;
        particles.push(new window.Particle(
          x, y, z,
          heartX * speed, heartY * speed, (Math.random() - 0.5) * 0.3,
          color, scene
        ));
      }
      break;
  }

  return particles;
}
window.createBurstPattern = createBurstPattern;
```

## Trail Renderer
Draw particle paths:

```javascript
function renderTrails(fireworks, scene) {
  fireworks.forEach(fw => {
    if (!fw.exploded) return;

    fw.particles.forEach(p => {
      if (p.trail.length < 2) return;

      const points = p.trail.map(t => new THREE.Vector3(t.x, t.y, t.z));
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      const colors = [];
      p.trail.forEach(t => {
        colors.push(p.color.r * t.life, p.color.g * t.life, p.color.b * t.life);
      });
      geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6
      });

      const line = new THREE.Line(geom, mat);
      scene.add(line);

      // Remove after render
      setTimeout(() => scene.remove(line), 16);
    });
  });
}
window.renderTrails = renderTrails;
```

## Launch System
Automatic firework launcher:

```javascript
class LaunchSystem {
  constructor(scene) {
    this.scene = scene;
    this.fireworks = [];
    this.lastLaunch = Date.now();
    this.patterns = ['sphere', 'ring', 'heart'];
  }

  update() {
    const cfg = window.fireworksConfig;
    const now = Date.now();

    // Launch new firework?
    if (now - this.lastLaunch > cfg.launchInterval) {
      this.lastLaunch = now;
      this.fireworks.push(new window.Firework(this.scene));
    }

    // Update all fireworks
    this.fireworks = this.fireworks.filter(fw => fw.update());

    // Render trails
    window.renderTrails(this.fireworks, this.scene);
  }

  clear() {
    this.fireworks.forEach(fw => fw.remove());
    this.fireworks = [];
  }
}
window.LaunchSystem = LaunchSystem;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initFireworksScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000510);
  scene.fog = new THREE.Fog(0x000510, 100, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 40, 120);
  camera.lookAt(0, 50, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Ground plane
  const groundGeom = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x001122 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Ambient light
  scene.add(new THREE.AmbientLight(0x111111));

  window.fireworksScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initFireworksScene = initFireworksScene;
```

## Execute
Run fireworks show:

```javascript
const { scene, camera, renderer } = window.initFireworksScene();
const launcher = new window.LaunchSystem(scene);

// Animation loop
function animate() {
  launcher.update();

  // Gentle camera sway
  const time = Date.now() * 0.0001;
  camera.position.x = Math.sin(time) * 20;
  camera.lookAt(0, 50, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🎆 Fireworks show started! Watch the sky light up!');
```

## Usage
Enjoy the fireworks show! Rockets launch and explode into colorful bursts. Modify `config.launchInterval` to change frequency, or `config.particlesPerBurst` for bigger explosions!

---
*🎆 Particle physics magic | Procedural pyrotechnics*
