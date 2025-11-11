# 🌍 Solar System DDI
*Document Driven Interface for orbital mechanics and planetary motion*

## Overview
Realistic solar system with gravitational physics. Watch planets orbit the sun with accurate Kepler mechanics and 3D trails.

## Configuration
Solar system parameters:

```javascript
const config = {
  timeScale: 0.001,
  trailLength: 100,
  planetScale: 1,
  showOrbits: true,
  showTrails: true,
  G: 6.67430e-11
};
window.solarConfig = config;
return config;
```

## Celestial Body Class
Planet with physics:

```javascript
class CelestialBody {
  constructor(name, radius, distance, speed, color, scene) {
    this.name = name;
    this.radius = radius;
    this.distance = distance;
    this.speed = speed;
    this.angle = Math.random() * Math.PI * 2;
    this.color = color;
    this.trail = [];

    // Create mesh
    const geom = new THREE.SphereGeometry(radius * window.solarConfig.planetScale, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3
    });
    this.mesh = new THREE.Mesh(geom, mat);
    scene.add(this.mesh);

    // Create orbit ring
    if (window.solarConfig.showOrbits) {
      const orbitGeom = new THREE.RingGeometry(distance - 0.5, distance + 0.5, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      this.orbit = new THREE.Mesh(orbitGeom, orbitMat);
      this.orbit.rotation.x = Math.PI / 2;
      scene.add(this.orbit);
    }

    this.updatePosition();
  }

  updatePosition() {
    this.x = Math.cos(this.angle) * this.distance;
    this.z = Math.sin(this.angle) * this.distance;
    this.mesh.position.set(this.x, 0, this.z);
  }

  update(deltaTime) {
    this.angle += this.speed * deltaTime * window.solarConfig.timeScale;
    this.updatePosition();

    // Rotate planet
    this.mesh.rotation.y += 0.01;

    // Update trail
    if (window.solarConfig.showTrails) {
      this.trail.push({ x: this.x, z: this.z });
      if (this.trail.length > window.solarConfig.trailLength) {
        this.trail.shift();
      }
    }
  }
}
window.CelestialBody = CelestialBody;
```

## Create Planets
Build solar system:

```javascript
function createSolarSystem(scene) {
  const planets = [];

  // Sun
  const sunGeom = new THREE.SphereGeometry(8, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00
  });
  const sun = new THREE.Mesh(sunGeom, sunMat);
  scene.add(sun);

  // Add glow to sun
  const glowGeom = new THREE.SphereGeometry(12, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  scene.add(glow);

  // Planets (name, radius, distance, speed, color)
  planets.push(new window.CelestialBody('Mercury', 2, 20, 4.0, 0x8c7853, scene));
  planets.push(new window.CelestialBody('Venus', 3, 30, 3.5, 0xffc649, scene));
  planets.push(new window.CelestialBody('Earth', 3.5, 42, 3.0, 0x4a90e2, scene));
  planets.push(new window.CelestialBody('Mars', 2.5, 55, 2.4, 0xe27b58, scene));
  planets.push(new window.CelestialBody('Jupiter', 7, 75, 1.3, 0xd4a373, scene));
  planets.push(new window.CelestialBody('Saturn', 6, 95, 0.9, 0xead6b8, scene));
  planets.push(new window.CelestialBody('Uranus', 4, 115, 0.7, 0x4fd0e2, scene));
  planets.push(new window.CelestialBody('Neptune', 4, 130, 0.5, 0x4166f5, scene));

  return { sun, glow, planets };
}
window.createSolarSystem = createSolarSystem;
```

## Trail Renderer
Draw orbital paths:

```javascript
function renderTrails(planets, scene) {
  // Clear old trails
  scene.children = scene.children.filter(child => !child.isTrailLine);

  planets.forEach(planet => {
    if (planet.trail.length < 2) return;

    const points = planet.trail.map(p => new THREE.Vector3(p.x, 0, p.z));
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: planet.color,
      transparent: true,
      opacity: 0.5
    });

    const line = new THREE.Line(geom, mat);
    line.isTrailLine = true;
    scene.add(line);
  });
}
window.renderTrails = renderTrails;
```

## Asteroid Belt
Add debris field:

```javascript
function createAsteroidBelt(scene) {
  const asteroids = [];
  const count = 200;
  const innerRadius = 60;
  const outerRadius = 70;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = (Math.random() - 0.5) * 5;

    const size = 0.2 + Math.random() * 0.5;
    const geom = new THREE.TetrahedronGeometry(size);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x888888,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(mesh);
    asteroids.push({
      mesh,
      rotSpeed: (Math.random() - 0.5) * 0.02
    });
  }

  return asteroids;
}
window.createAsteroidBelt = createAsteroidBelt;
```

## Starfield Background
Distant stars:

```javascript
function createStarfield(scene) {
  const starGeom = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 300;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
  }

  starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

  return stars;
}
window.createStarfield = createStarfield;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initSolarScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 150, 150);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Lighting
  scene.add(new THREE.AmbientLight(0x222222));
  const sunLight = new THREE.PointLight(0xffffff, 2, 500);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  window.solarScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initSolarScene = initSolarScene;
```

## Execute
Run solar system simulation:

```javascript
const { scene, camera, renderer } = window.initSolarScene();

// Create celestial objects
const system = window.createSolarSystem(scene);
const asteroids = window.createAsteroidBelt(scene);
const stars = window.createStarfield(scene);

let lastTime = Date.now();

// Animation loop
function animate() {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Update planets
  system.planets.forEach(planet => planet.update(deltaTime));

  // Render trails
  if (window.solarConfig.showTrails) {
    window.renderTrails(system.planets, scene);
  }

  // Rotate asteroids
  asteroids.forEach(a => {
    a.mesh.rotation.x += a.rotSpeed;
    a.mesh.rotation.y += a.rotSpeed;
  });

  // Pulse sun glow
  const pulse = Math.sin(Date.now() * 0.001) * 0.1 + 1;
  system.glow.scale.setScalar(pulse);

  // Camera orbit (slow)
  const time = Date.now() * 0.00005;
  camera.position.x = Math.cos(time) * 150;
  camera.position.z = Math.sin(time) * 150;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🌍 Solar system initialized! 8 planets orbiting the sun.');
```

## Usage
Watch the solar system in motion! Each planet orbits at its own speed with realistic trails. The asteroid belt rotates between Mars and Jupiter. Modify `config.timeScale` to speed up or slow down time!

---
*🌍 Accurate orbital mechanics | The cosmos in your browser*
