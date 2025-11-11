# 🌐 REST API System DDI
*Document Driven Interface for building API endpoints*

## Overview
Create a mock REST API system with routes, middleware, and data management. Visualize API requests flowing through your system in 3D.

## Configuration
API system parameters:

```javascript
const config = {
  baseUrl: '/api',
  version: 'v1',
  port: 3000,
  maxRequestsPerSec: 100,
  timeout: 5000,
  logRequests: true
};
window.apiConfig = config;
return config;
```

## Request Class
HTTP request representation:

```javascript
class ApiRequest {
  constructor(method, path, data = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.method = method;
    this.path = path;
    this.data = data;
    this.timestamp = Date.now();
    this.status = 'pending';
    this.response = null;
  }

  toJSON() {
    return {
      id: this.id,
      method: this.method,
      path: this.path,
      data: this.data,
      status: this.status,
      response: this.response,
      duration: Date.now() - this.timestamp
    };
  }
}
window.ApiRequest = ApiRequest;
```

## Route System
Define API endpoints and handlers:

```javascript
class Router {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
  }

  register(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
    console.log(`✅ Registered ${method} ${path}`);
  }

  get(path, handler) {
    this.register('GET', path, handler);
  }

  post(path, handler) {
    this.register('POST', path, handler);
  }

  put(path, handler) {
    this.register('PUT', path, handler);
  }

  delete(path, handler) {
    this.register('DELETE', path, handler);
  }

  async execute(request) {
    // Run middleware
    for (let mw of this.middleware) {
      await mw(request);
    }

    // Find handler
    const key = `${request.method}:${request.path}`;
    const handler = this.routes.get(key);

    if (!handler) {
      request.status = 'error';
      request.response = { error: 'Route not found', code: 404 };
      return request;
    }

    // Execute handler
    try {
      request.response = await handler(request);
      request.status = 'success';
    } catch (error) {
      request.status = 'error';
      request.response = { error: error.message, code: 500 };
    }

    return request;
  }
}
window.Router = Router;
```

## Data Store
In-memory database:

```javascript
class DataStore {
  constructor() {
    this.collections = new Map();
    this.nextId = 1;
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name);
  }

  create(collectionName, data) {
    const coll = this.collection(collectionName);
    const id = this.nextId++;
    const item = { id, ...data, createdAt: Date.now() };
    coll.set(id, item);
    return item;
  }

  read(collectionName, id) {
    const coll = this.collection(collectionName);
    return coll.get(id) || null;
  }

  readAll(collectionName) {
    const coll = this.collection(collectionName);
    return Array.from(coll.values());
  }

  update(collectionName, id, data) {
    const coll = this.collection(collectionName);
    const item = coll.get(id);
    if (!item) return null;

    const updated = { ...item, ...data, updatedAt: Date.now() };
    coll.set(id, updated);
    return updated;
  }

  delete(collectionName, id) {
    const coll = this.collection(collectionName);
    return coll.delete(id);
  }
}
window.DataStore = DataStore;
```

## Define API Routes
CRUD endpoints for resources:

```javascript
const router = new window.Router();
const db = new window.DataStore();

// Middleware: logging
router.use(async (req) => {
  if (window.apiConfig.logRequests) {
    console.log(`${req.method} ${req.path}`, req.data);
  }
});

// Health check
router.get('/health', async () => {
  return {
    status: 'healthy',
    uptime: Date.now() - window.apiStartTime,
    version: window.apiConfig.version
  };
});

// Users CRUD
router.get('/users', async () => {
  return { users: db.readAll('users') };
});

router.post('/users', async (req) => {
  const user = db.create('users', req.data);
  return { user, message: 'User created' };
});

router.get('/users/:id', async (req) => {
  const id = parseInt(req.path.split('/').pop());
  const user = db.read('users', id);
  if (!user) throw new Error('User not found');
  return { user };
});

router.put('/users/:id', async (req) => {
  const id = parseInt(req.path.split('/').pop());
  const user = db.update('users', id, req.data);
  if (!user) throw new Error('User not found');
  return { user, message: 'User updated' };
});

router.delete('/users/:id', async (req) => {
  const id = parseInt(req.path.split('/').pop());
  const success = db.delete('users', id);
  if (!success) throw new Error('User not found');
  return { message: 'User deleted' };
});

window.apiRouter = router;
window.apiDb = db;
window.apiStartTime = Date.now();
```

## Request Visualizer
Show API calls in 3D:

```javascript
class ApiVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.requests = [];
    this.maxRequests = 50;
    this.createEndpoints();
  }

  createEndpoints() {
    this.endpoints = [
      { path: '/health', pos: [-30, 0, 0], color: 0x00ff00 },
      { path: '/users', pos: [0, 0, 0], color: 0x00ffff },
      { path: '/posts', pos: [30, 0, 0], color: 0xff00ff }
    ];

    this.endpoints.forEach(ep => {
      const geom = new THREE.BoxGeometry(8, 8, 8);
      const mat = new THREE.MeshPhongMaterial({
        color: ep.color,
        emissive: ep.color,
        emissiveIntensity: 0.5
      });
      ep.mesh = new THREE.Mesh(geom, mat);
      ep.mesh.position.set(ep.pos[0], ep.pos[1], ep.pos[2]);
      this.scene.add(ep.mesh);
    });
  }

  visualizeRequest(request) {
    // Find endpoint
    const ep = this.endpoints.find(e => request.path.includes(e.path.split('/').pop()));
    if (!ep) return;

    // Create request particle
    const geom = new THREE.SphereGeometry(1, 8, 8);
    const color = request.status === 'success' ? 0x00ff00 :
                  request.status === 'error' ? 0xff0000 : 0xffff00;
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 20, 0);
    this.scene.add(mesh);

    const vizRequest = {
      mesh,
      target: ep.mesh.position.clone(),
      request,
      progress: 0
    };

    this.requests.push(vizRequest);

    // Limit request count
    if (this.requests.length > this.maxRequests) {
      const old = this.requests.shift();
      this.scene.remove(old.mesh);
    }
  }

  update() {
    this.requests.forEach((req, i) => {
      req.progress += 0.02;

      if (req.progress >= 1) {
        req.mesh.position.copy(req.target);
        req.mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.3);
      } else {
        // Animate to endpoint
        req.mesh.position.y = 20 * (1 - req.progress);
        req.mesh.position.x = req.target.x * req.progress;
        req.mesh.position.z = req.target.z * req.progress;
      }
    });

    // Pulse endpoints
    this.endpoints.forEach((ep, i) => {
      const scale = 1 + Math.sin(Date.now() * 0.003 + i * 2) * 0.1;
      ep.mesh.scale.setScalar(scale);
    });
  }
}
window.ApiVisualizer = ApiVisualizer;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initApiScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001020);
  scene.fog = new THREE.Fog(0x001020, 50, 200);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(50, 40, 50);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x404040));
  const light = new THREE.PointLight(0xffffff, 1, 300);
  light.position.set(0, 50, 50);
  scene.add(light);

  window.apiScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initApiScene = initApiScene;
```

## Execute
Run API system with visualization:

```javascript
const { scene, camera, renderer } = window.initApiScene();
const viz = new window.ApiVisualizer(scene);

// Seed some users
window.apiDb.create('users', { name: 'Alice', email: 'alice@example.com' });
window.apiDb.create('users', { name: 'Bob', email: 'bob@example.com' });

// Simulate requests
async function simulateRequests() {
  const requests = [
    new window.ApiRequest('GET', '/health'),
    new window.ApiRequest('GET', '/users'),
    new window.ApiRequest('POST', '/users', { name: 'Charlie', email: 'charlie@example.com' }),
    new window.ApiRequest('GET', '/users/1'),
  ];

  for (let req of requests) {
    const result = await window.apiRouter.execute(req);
    viz.visualizeRequest(result);
    console.log('📨', result.toJSON());
    await new Promise(r => setTimeout(r, 1000));
  }
}

// Animation loop
function animate() {
  viz.update();

  const time = Date.now() * 0.0001;
  camera.position.x = Math.cos(time) * 50;
  camera.position.z = Math.sin(time) * 50;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
simulateRequests();

console.log('🌐 API System running! Check console for request logs.');
```

## Usage
Watch API requests flow to endpoints! Green spheres = success, red = errors. Boxes represent endpoints. Console shows detailed request/response logs.

Try modifying the `simulateRequests` function to add more requests or create error conditions!

---
*🌐 REST API visualization | Backend systems made visible*
