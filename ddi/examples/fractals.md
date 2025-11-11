# 🌳 Fractal Systems DDI
*Document Driven Interface for L-systems and recursive structures*

## Overview
Generate beautiful fractal trees using L-system grammars. Watch branches grow recursively in 3D space.

## Configuration
L-system parameters:

```javascript
const config = {
  axiom: 'F',
  rules: {
    'F': 'F[+F]F[-F]F'
  },
  angle: 25,
  iterations: 4,
  length: 10,
  decay: 0.7,
  thickness: 0.5
};
window.fractalConfig = config;
return config;
```

## L-System Generator
Apply production rules recursively:

```javascript
function generateLSystem(axiom, rules, iterations) {
  let result = axiom;

  for (let i = 0; i < iterations; i++) {
    let next = '';

    for (let char of result) {
      next += rules[char] || char;
    }

    result = next;
  }

  console.log(`Generated ${result.length} symbols in ${iterations} iterations`);
  return result;
}
window.generateLSystem = generateLSystem;
```

## Turtle Graphics
Interpret L-system commands:

```javascript
class Turtle {
  constructor(scene, length, angle, thickness) {
    this.scene = scene;
    this.length = length;
    this.angle = angle * Math.PI / 180;
    this.thickness = thickness;
    this.stack = [];
    this.reset();
  }

  reset() {
    this.pos = new THREE.Vector3(0, -50, 0);
    this.dir = new THREE.Vector3(0, 1, 0);
    this.right = new THREE.Vector3(1, 0, 0);
  }

  forward() {
    const newPos = this.pos.clone().add(
      this.dir.clone().multiplyScalar(this.length)
    );

    const points = [this.pos.clone(), newPos];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(this.pos.y / 100, 0.8, 0.5),
      linewidth: this.thickness
    });

    const line = new THREE.Line(geom, mat);
    this.scene.add(line);

    this.pos.copy(newPos);
    this.length *= window.fractalConfig.decay;
  }

  turnLeft() {
    this.dir.applyAxisAngle(
      new THREE.Vector3(0, 0, 1),
      this.angle
    );
  }

  turnRight() {
    this.dir.applyAxisAngle(
      new THREE.Vector3(0, 0, 1),
      -this.angle
    );
  }

  push() {
    this.stack.push({
      pos: this.pos.clone(),
      dir: this.dir.clone(),
      length: this.length
    });
  }

  pop() {
    const state = this.stack.pop();
    this.pos.copy(state.pos);
    this.dir.copy(state.dir);
    this.length = state.length;
  }
}
window.Turtle = Turtle;
```

## Render Fractal
Draw L-system using turtle graphics:

```javascript
function renderFractal(lsystem, scene, config) {
  const turtle = new window.Turtle(
    scene,
    config.length,
    config.angle,
    config.thickness
  );

  for (let char of lsystem) {
    switch(char) {
      case 'F':
        turtle.forward();
        break;
      case '+':
        turtle.turnLeft();
        break;
      case '-':
        turtle.turnRight();
        break;
      case '[':
        turtle.push();
        break;
      case ']':
        turtle.pop();
        break;
    }
  }

  console.log('Fractal rendered successfully');
}
window.renderFractal = renderFractal;
```

## Animated Growth
Grow tree over time:

```javascript
class AnimatedFractal {
  constructor(lsystem, scene, config) {
    this.lsystem = lsystem;
    this.scene = scene;
    this.config = config;
    this.index = 0;
    this.turtle = new window.Turtle(
      scene,
      config.length,
      config.angle,
      config.thickness
    );
  }

  step() {
    if (this.index >= this.lsystem.length) {
      return false;
    }

    const char = this.lsystem[this.index];

    switch(char) {
      case 'F':
        this.turtle.forward();
        break;
      case '+':
        this.turtle.turnLeft();
        break;
      case '-':
        this.turtle.turnRight();
        break;
      case '[':
        this.turtle.push();
        break;
      case ']':
        this.turtle.pop();
        break;
    }

    this.index++;
    return true;
  }
}
window.AnimatedFractal = AnimatedFractal;
```

## Multiple Fractals
Create forest of variations:

```javascript
function createFractalForest(scene, count) {
  const fractals = [];
  const variations = [
    { axiom: 'F', rules: { 'F': 'F[+F]F[-F]F' }, angle: 25 },
    { axiom: 'F', rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' }, angle: 22.5 },
    { axiom: 'X', rules: { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' }, angle: 25 },
  ];

  for (let i = 0; i < count; i++) {
    const variant = variations[i % variations.length];
    const x = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;

    const lsystem = window.generateLSystem(
      variant.axiom,
      variant.rules,
      3
    );

    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);

    const localScene = group;
    window.renderFractal(lsystem, localScene, {
      ...window.fractalConfig,
      angle: variant.angle,
      length: 8
    });

    fractals.push(group);
  }

  return fractals;
}
window.createFractalForest = createFractalForest;
```

## Scene Setup
Initialize 3D environment:

```javascript
function initFractalScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001a0a);
  scene.fog = new THREE.Fog(0x001a0a, 100, 300);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(80, 60, 80);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);

  scene.add(new THREE.AmbientLight(0x333333));
  const light = new THREE.PointLight(0x00ff88, 1, 400);
  light.position.set(0, 100, 0);
  scene.add(light);

  window.fractalScene = { scene, camera, renderer };
  return { scene, camera, renderer };
}
window.initFractalScene = initFractalScene;
```

## Execute
Generate and render fractal tree:

```javascript
const { scene, camera, renderer } = window.initFractalScene();

const lsystem = window.generateLSystem(
  window.fractalConfig.axiom,
  window.fractalConfig.rules,
  window.fractalConfig.iterations
);

window.renderFractal(lsystem, scene, window.fractalConfig);

// Animation loop
function animate() {
  const time = Date.now() * 0.0002;
  camera.position.x = Math.cos(time) * 80;
  camera.position.z = Math.sin(time) * 80;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

## Usage
Run all blocks to generate a beautiful fractal tree. Modify `config.rules` and `config.angle` for different patterns. Try the forest function for multiple trees!

---
*🌳 L-systems made visual | Recursive beauty in code*
