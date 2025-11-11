# 🧱 Voxel World DDI
*Document Driven Interface for procedural voxel generation*

## Overview
Create Minecraft-style voxel worlds with autonomous builder agents. Watch AI construct structures block by block.

## Configuration
World generation parameters:

```javascript
const config = {
  worldSize: 32,
  chunkSize: 16,
  blockSize: 2,
  seaLevel: 8,
  agentCount: 5,
  buildSpeed: 0.3
};
window.voxelConfig = config;
return config;
```

## Block Types
Define voxel materials:

```javascript
const blockTypes = {
  AIR: { id: 0, color: null },
  GRASS: { id: 1, color: 0x33cc33 },
  DIRT: { id: 2, color: 0x8B4513 },
  STONE: { id: 3, color: 0x888888 },
  WOOD: { id: 4, color: 0xA0522D },
  LEAVES: { id: 5, color: 0x228B22 },
  WATER: { id: 6, color: 0x1E90FF }
};
window.blockTypes = blockTypes;
```

## Terrain Generation
Procedural height map with noise:

```javascript
function generateTerrain(size) {
  const terrain = new Array(size);

  for (let x = 0; x < size; x++) {
    terrain[x] = new Array(size);

    for (let z = 0; z < size; z++) {
      // Simple noise function
      const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5 +
                    Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2;

      const height = Math.floor(window.voxelConfig.seaLevel + noise);
      terrain[x][z] = Math.max(1, height);
    }
  }

  console.log(`Generated ${size}x${size} terrain`);
  return terrain;
}
window.generateTerrain = generateTerrain;
```

## Voxel Mesh
Create instanced blocks:

```javascript
function createVoxelMesh(x, y, z, blockType, scene) {
  const cfg = window.voxelConfig;
  const types = window.blockTypes;

  if (blockType === types.AIR.id) return null;

  const geom = new THREE.BoxGeometry(cfg.blockSize, cfg.blockSize, cfg.blockSize);
  const color = Object.values(types).find(t => t.id === blockType)?.color || 0xffffff;
  const mat = new THREE.MeshLambertMaterial({
    color,
    transparent: blockType === types.WATER.id,
    opacity: blockType === types.WATER.id ? 0.6 : 1
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(
    x * cfg.blockSize,
    y * cfg.blockSize,
    z * cfg.blockSize
  );

  scene.add(mesh);
  return mesh;
}
window.createVoxelMesh = createVoxelMesh;
```

## World Builder
Construct 3D world from terrain data:

```javascript
function buildWorld(terrain, scene) {
  const world = [];
  const size = terrain.length;
  const types = window.blockTypes;

  for (let x = 0; x < size; x++) {
    world[x] = [];

    for (let z = 0; z < size; z++) {
      world[x][z] = [];
      const height = terrain[x][z];

      for (let y = 0; y <= height; y++) {
        let blockType;

        if (y === height && height > window.voxelConfig.seaLevel) {
          blockType = types.GRASS.id;
        } else if (y > height - 3) {
          blockType = types.DIRT.id;
        } else {
          blockType = types.STONE.id;
        }

        const mesh = window.createVoxelMesh(x, y, z, blockType, scene);
        world[x][z][y] = { type: blockType, mesh };
      }
    }
  }

  window.voxelWorld = world;
  return world;
}
window.buildWorld = buildWorld;
```

## Builder Agent
Autonomous construction agent:

```javascript
class BuilderAgent {
  constructor(world, scene) {
    this.world = world;
    this.scene = scene;
    this.x = Math.floor(Math.random() * world.length);
    this.z = Math.floor(Math.random() * world[0].length);
    this.y = this.getTopY(this.x, this.z);
    this.buildQueue = [];

    // Agent mesh
    const geom = new THREE.ConeGeometry(1, 3, 4);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.8
    });
    this.mesh = new THREE.Mesh(geom, mat);
    scene.add(this.mesh);
    this.updatePosition();
  }

  getTopY(x, z) {
    if (!this.world[x] || !this.world[x][z]) return 0;
    return this.world[x][z].length - 1;
  }

  updatePosition() {
    const cfg = window.voxelConfig;
    this.mesh.position.set(
      this.x * cfg.blockSize,
      (this.y + 2) * cfg.blockSize,
      this.z * cfg.blockSize
    );
  }

  move() {
    const dx = Math.floor(Math.random() * 3) - 1;
    const dz = Math.floor(Math.random() * 3) - 1;

    this.x = Math.max(0, Math.min(this.world.length - 1, this.x + dx));
    this.z = Math.max(0, Math.min(this.world[0].length - 1, this.z + dz));
    this.y = this.getTopY(this.x, this.z);

    this.updatePosition();
  }

  build() {
    if (Math.random() > window.voxelConfig.buildSpeed) return;

    const newY = this.y + 1;
    const types = window.blockTypes;
    const blockType = Math.random() > 0.3 ? types.WOOD.id : types.LEAVES.id;

    const mesh = window.createVoxelMesh(this.x, newY, this.z, blockType, this.scene);

    if (!this.world[this.x][this.z][newY]) {
      this.world[this.x][this.z][newY] = { type: blockType, mesh };
      this.y = newY;
      this.updatePosition();
    }
  }

  act() {
    if (Math.random() > 0.5) {
      this.move();
    } else {
      this.build();
    }
  }
}
window.BuilderAgent = BuilderAgent;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initVoxelScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(60, 60, 60);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.4);
  light.position.set(50, 100, 50);
  scene.add(light);

  window.voxelScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initVoxelScene = initVoxelScene;
```

## Execute
Generate world and spawn agents:

```javascript
const { scene, camera, renderer } = window.initVoxelScene();

// Generate terrain
const terrain = window.generateTerrain(window.voxelConfig.worldSize);
const world = window.buildWorld(terrain, scene);

// Spawn builder agents
const agents = [];
for (let i = 0; i < window.voxelConfig.agentCount; i++) {
  agents.push(new window.BuilderAgent(world, scene));
}

// Animation loop
function animate() {
  // Agents act
  agents.forEach(agent => agent.act());

  // Rotate camera
  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 60;
  camera.position.z = Math.sin(time) * 60;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

console.log(`World created with ${agents.length} builder agents`);
```

## Usage
Watch autonomous agents build structures! Purple cones are builders. They randomly move and place wood/leaf blocks. The world grows organically over time.

---
*🧱 Procedural voxel generation | Autonomous construction AI*
