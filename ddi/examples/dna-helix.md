# 🧬 DNA Helix DDI
*Document Driven Interface for molecular biology visualization*

## Overview
Stunning double helix DNA structure with base pairs, rotation animation, and genetic information flow. Watch DNA replicate and transcribe!

## Configuration
DNA parameters:

```javascript
const config = {
  helixRadius: 10,
  helixHeight: 100,
  turns: 5,
  basePairs: 50,
  rotationSpeed: 0.01,
  showLabels: true,
  colorScheme: 'classic'
};
window.dnaConfig = config;
return config;
```

## Base Pair Class
Individual nucleotide pair:

```javascript
class BasePair {
  constructor(position, type, scene) {
    this.position = position;
    this.type = type; // A-T, G-C, T-A, C-G
    this.angle = 0;

    const colors = {
      'A': 0xff0000, // Adenine - red
      'T': 0x00ff00, // Thymine - green
      'G': 0x0000ff, // Guanine - blue
      'C': 0xffff00  // Cytosine - yellow
    };

    // Create nucleotide spheres
    const geom = new THREE.SphereGeometry(1.5, 16, 16);

    const mat1 = new THREE.MeshPhongMaterial({
      color: colors[type[0]],
      emissive: colors[type[0]],
      emissiveIntensity: 0.3
    });
    this.sphere1 = new THREE.Mesh(geom, mat1);

    const mat2 = new THREE.MeshPhongMaterial({
      color: colors[type[2]],
      emissive: colors[type[2]],
      emissiveIntensity: 0.3
    });
    this.sphere2 = new THREE.Mesh(geom, mat2);

    scene.add(this.sphere1);
    scene.add(this.sphere2);

    // Create hydrogen bond
    const bondGeom = new THREE.CylinderGeometry(0.3, 0.3, 1);
    const bondMat = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.5
    });
    this.bond = new THREE.Mesh(bondGeom, bondMat);
    scene.add(this.bond);

    this.updatePosition();
  }

  updatePosition() {
    const cfg = window.dnaConfig;
    const y = this.position.y;
    const angle = this.position.angle + this.angle;

    // Strand 1
    const x1 = Math.cos(angle) * cfg.helixRadius;
    const z1 = Math.sin(angle) * cfg.helixRadius;
    this.sphere1.position.set(x1, y, z1);

    // Strand 2 (opposite side)
    const x2 = Math.cos(angle + Math.PI) * cfg.helixRadius;
    const z2 = Math.sin(angle + Math.PI) * cfg.helixRadius;
    this.sphere2.position.set(x2, y, z2);

    // Bond position and rotation
    this.bond.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    this.bond.rotation.z = Math.atan2(z2 - z1, x2 - x1);
    this.bond.scale.y = cfg.helixRadius * 2;
  }

  rotate(delta) {
    this.angle += delta;
    this.updatePosition();
  }
}
window.BasePair = BasePair;
```

## DNA Strand
Sugar-phosphate backbone:

```javascript
class DNAStrand {
  constructor(scene, side) {
    this.scene = scene;
    this.side = side; // 0 or PI for opposite strands
    this.segments = [];

    const cfg = window.dnaConfig;
    const segmentCount = cfg.basePairs * 2;

    // Create backbone cylinders
    for (let i = 0; i < segmentCount; i++) {
      const geom = new THREE.CylinderGeometry(0.5, 0.5, 1);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 50
      });
      const segment = new THREE.Mesh(geom, mat);
      scene.add(segment);
      this.segments.push(segment);
    }
  }

  update(basePairs, angle) {
    const cfg = window.dnaConfig;

    basePairs.forEach((bp, i) => {
      const idx = i * 2;
      const y = bp.position.y;
      const a = bp.position.angle + angle + this.side;

      // Position segments along helix
      const x = Math.cos(a) * cfg.helixRadius;
      const z = Math.sin(a) * cfg.helixRadius;

      if (this.segments[idx]) {
        this.segments[idx].position.set(x, y - 1, z);
        this.segments[idx].rotation.z = a + Math.PI / 2;
      }

      if (this.segments[idx + 1]) {
        this.segments[idx + 1].position.set(x, y + 1, z);
        this.segments[idx + 1].rotation.z = a + Math.PI / 2;
      }
    });
  }
}
window.DNAStrand = DNAStrand;
```

## Generate Sequence
Random DNA sequence:

```javascript
function generateSequence(length) {
  const bases = ['A', 'T', 'G', 'C'];
  const pairs = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G'
  };

  const sequence = [];
  for (let i = 0; i < length; i++) {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const complement = pairs[base];
    sequence.push(`${base}-${complement}`);
  }

  console.log(`Generated ${length} base pairs`);
  return sequence;
}
window.generateSequence = generateSequence;
```

## Create DNA Molecule
Build complete helix:

```javascript
function createDNA(scene) {
  const cfg = window.dnaConfig;
  const sequence = window.generateSequence(cfg.basePairs);
  const basePairs = [];

  const yStep = cfg.helixHeight / cfg.basePairs;
  const angleStep = (cfg.turns * Math.PI * 2) / cfg.basePairs;

  for (let i = 0; i < sequence.length; i++) {
    const position = {
      y: i * yStep - cfg.helixHeight / 2,
      angle: i * angleStep
    };

    const bp = new window.BasePair(position, sequence[i], scene);
    basePairs.push(bp);
  }

  // Create backbones
  const strand1 = new window.DNAStrand(scene, 0);
  const strand2 = new window.DNAStrand(scene, Math.PI);

  return { basePairs, strand1, strand2, sequence };
}
window.createDNA = createDNA;
```

## Replication Effect
DNA splitting and copying:

```javascript
class DNAReplication {
  constructor(dna, scene) {
    this.dna = dna;
    this.scene = scene;
    this.progress = 0;
    this.active = false;
  }

  start() {
    this.active = true;
    this.progress = 0;
  }

  update() {
    if (!this.active) return;

    this.progress += 0.01;

    // Split helix
    const split = Math.sin(this.progress * Math.PI) * 20;

    this.dna.basePairs.forEach((bp, i) => {
      const factor = Math.max(0, Math.min(1, this.progress * 2 - i / this.dna.basePairs.length));
      const offset = split * factor;

      const angle = bp.position.angle;
      const x1 = Math.cos(angle) * (window.dnaConfig.helixRadius + offset);
      const z1 = Math.sin(angle) * (window.dnaConfig.helixRadius + offset);
      bp.sphere1.position.x = x1;
      bp.sphere1.position.z = z1;

      const x2 = Math.cos(angle + Math.PI) * (window.dnaConfig.helixRadius + offset);
      const z2 = Math.sin(angle + Math.PI) * (window.dnaConfig.helixRadius + offset);
      bp.sphere2.position.x = x2;
      bp.sphere2.position.z = z2;

      // Fade bonds
      bp.bond.material.opacity = 0.5 * (1 - factor);
    });

    if (this.progress >= 1) {
      this.active = false;
      this.progress = 0;

      // Reset positions
      this.dna.basePairs.forEach(bp => bp.updatePosition());
    }
  }
}
window.DNAReplication = DNAReplication;
```

## Info Labels
Display sequence info:

```javascript
function createLabels(sequence, scene) {
  if (!window.dnaConfig.showLabels) return [];

  const labels = [];
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Count bases
  const counts = { A: 0, T: 0, G: 0, C: 0 };
  sequence.forEach(pair => {
    counts[pair[0]]++;
  });

  // Create label texture
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#0ff';
  ctx.font = '12px monospace';
  ctx.fillText(`A:${counts.A} T:${counts.T}`, 5, 20);
  ctx.fillText(`G:${counts.G} C:${counts.C}`, 5, 40);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(20, -60, 0);
  sprite.scale.set(20, 10, 1);
  scene.add(sprite);

  return [sprite];
}
window.createLabels = createLabels;
```

## Scene Setup
Initialize molecular environment:

```javascript
function initDNAScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000a14);
  scene.fog = new THREE.Fog(0x000a14, 100, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(40, 0, 40);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  // Lighting
  scene.add(new THREE.AmbientLight(0x333333));

  const light1 = new THREE.PointLight(0xff0000, 1, 200);
  light1.position.set(30, 30, 30);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x0000ff, 1, 200);
  light2.position.set(-30, -30, -30);
  scene.add(light2);

  window.dnaScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initDNAScene = initDNAScene;
```

## Execute
Run DNA visualization:

```javascript
const { scene, camera, renderer } = window.initDNAScene();

// Create DNA molecule
const dna = window.createDNA(scene);
const labels = window.createLabels(dna.sequence, scene);
const replication = new window.DNAReplication(dna, scene);

let rotation = 0;

// Start replication every 5 seconds
setInterval(() => replication.start(), 5000);

// Animation loop
function animate() {
  rotation += window.dnaConfig.rotationSpeed;

  // Rotate entire helix
  dna.basePairs.forEach(bp => bp.rotate(window.dnaConfig.rotationSpeed));
  dna.strand1.update(dna.basePairs, rotation);
  dna.strand2.update(dna.basePairs, rotation);

  // Update replication
  replication.update();

  // Camera orbit
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 60;
  camera.position.z = Math.sin(time) * 60;
  camera.position.y = Math.sin(time * 0.5) * 20;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('🧬 DNA helix rendering! Watch for replication events...');
```

## Usage
Explore the molecule of life! Watch the double helix rotate, showing complementary base pairs (A-T, G-C). Every 5 seconds, the DNA splits and replicates. Color-coded nucleotides make the structure clear and beautiful!

---
*🧬 Molecular biology | The blueprint of life visualized*
