# 🤖 Agent Behavior Library
## Reusable Components for Infinite Agent Worlds

---

## 🧬 Core Agent Structure (Copy-Paste Ready)

```javascript
// Ultra-compressed agent template
const A={
  m:null,        // THREE.Mesh
  x:0,y:0,z:0,  // position
  tx:0,tz:0,    // target
  s:0,          // state (0=idle,1=move,2=work,3=return)
  i:[],         // inventory
  e:100,        // energy
  sp:.5,        // speed
  task:null     // current task
}
```

---

## 🎯 Behavior Modules

### 1. **Pathfinding (Simple)**
```javascript
updatePath(a){
  let dx=a.tx-a.x,dz=a.tz-a.z;
  let d=Math.sqrt(dx*dx+dz*dz);
  if(d<2)return 1; // reached
  a.x+=dx/d*a.sp;
  a.z+=dz/d*a.sp;
  return 0;
}
```

### 2. **Nearest Target Selection**
```javascript
findNearest(a,targets){
  let n=null,md=999;
  targets.forEach(t=>{
    let d=Math.hypot(t.x-a.x,t.z-a.z);
    if(d<md){md=d;n=t}
  });
  return n;
}
```

### 3. **Swarm Behavior**
```javascript
swarm(a,others,r=20){
  let cx=0,cz=0,ct=0;
  others.forEach(o=>{
    let d=Math.hypot(o.x-a.x,o.z-a.z);
    if(d<r){cx+=o.x;cz+=o.z;ct++}
  });
  if(ct){a.tx=cx/ct;a.tz=cz/ct}
}
```

### 4. **Resource Collection**
```javascript
collect(a,res){
  if(a.s===2){// working state
    a.work=(a.work||0)+1;
    if(a.work>20){
      a.i.push(res.type);
      res.collected=1;
      a.s=3; // return state
      a.work=0;
    }
  }
}
```

### 5. **Building/Construction**
```javascript
build(a,world){
  if(a.s===2){
    a.buildTime=(a.buildTime||0)+1;
    if(a.buildTime>30){
      world.addVoxel(a.x,a.y,a.z,a.color);
      a.buildTime=0;
      a.s=0; // back to idle
    }
  }
}
```

### 6. **State Machine**
```javascript
stateMachine(a){
  switch(a.s){
    case 0: // idle
      if(Math.random()<.05)a.s=1;
      break;
    case 1: // seeking/moving
      if(this.updatePath(a))a.s=2;
      break;
    case 2: // working
      // work logic here
      break;
    case 3: // returning
      if(Math.hypot(a.x,a.z)<5)a.s=4;
      break;
    case 4: // depositing
      a.i=[];
      a.s=0;
      break;
  }
}
```

### 7. **Energy System**
```javascript
updateEnergy(a){
  a.e-=.1; // decay
  if(a.s===2)a.e-=.5; // working costs more
  if(a.e<20)a.s=3; // force return
  if(a.e<=0)return 1; // died
  return 0;
}
```

### 8. **Team/Hierarchy**
```javascript
teamBehavior(a,agents){
  let leader=agents.find(x=>x.team===a.team&&x.role==='leader');
  if(leader&&a.role!=='leader'){
    a.tx=leader.tx;
    a.tz=leader.tz;
  }
}
```

---

## 🌍 World Generation Patterns

### Voxel Placement
```javascript
buildVoxel(x,y,z,c){
  let k=`${x|0},${y|0},${z|0}`;
  if(this.M[k])return;
  let g=new THREE.BoxGeometry(2,2,2);
  let m=new THREE.MeshLambertMaterial({color:c});
  let v=new THREE.Mesh(g,m);
  v.position.set(x,y,z);
  this.s.add(v);
  this.M[k]=v;
}
```

### Perlin-Like Terrain
```javascript
terrain(x,z){
  return Math.sin(x*.1)*Math.cos(z*.1)*10+
         Math.sin(x*.05)*5+
         Math.random()*2;
}
```

### Cluster Spawning
```javascript
spawnCluster(x,z,n,r){
  for(let i=0;i<n;i++){
    let px=x+(Math.random()-.5)*r;
    let pz=z+(Math.random()-.5)*r;
    this.spawnResource(px,pz);
  }
}
```

---

## 🎨 Visual Effects

### Agent Trail
```javascript
addTrail(a){
  let g=new THREE.SphereGeometry(.5);
  let m=new THREE.MeshBasicMaterial({
    color:a.color,
    transparent:1,
    opacity:.5
  });
  let t=new THREE.Mesh(g,m);
  t.position.set(a.x,a.y,a.z);
  this.s.add(t);
  setTimeout(()=>this.s.remove(t),2000);
}
```

### Particle Burst
```javascript
burst(x,y,z,c,n=10){
  for(let i=0;i<n;i++){
    let p=new THREE.Mesh(
      new THREE.SphereGeometry(.3),
      new THREE.MeshBasicMaterial({color:c})
    );
    p.position.set(x,y,z);
    p.v={
      x:(Math.random()-.5)*2,
      y:Math.random()*2,
      z:(Math.random()-.5)*2
    };
    this.particles.push(p);
    this.s.add(p);
  }
}
```

---

## 🧠 AI Algorithms

### Flocking (Boids)
```javascript
flock(a,others){
  let sep={x:0,z:0};  // separation
  let ali={x:0,z:0};  // alignment
  let coh={x:0,z:0};  // cohesion
  let ct=0;

  others.forEach(o=>{
    let d=Math.hypot(o.x-a.x,o.z-a.z);
    if(d<20&&d>0){
      sep.x+=a.x-o.x;
      sep.z+=a.z-o.z;
      ali.x+=o.vx||0;
      ali.z+=o.vz||0;
      coh.x+=o.x;
      coh.z+=o.z;
      ct++;
    }
  });

  if(ct){
    a.vx=(sep.x+ali.x/ct+(coh.x/ct-a.x))*.1;
    a.vz=(sep.z+ali.z/ct+(coh.z/ct-a.z))*.1;
  }
}
```

### Genetic Evolution
```javascript
evolve(a){
  a.fitness=a.resourcesCollected*10+a.age;
  if(a.fitness>100&&Math.random()<.01){
    let child={...a}; // clone
    child.mutate=Math.random()*.2-.1;
    child.sp+=child.mutate;
    return child;
  }
}
```

---

## 📦 World Templates (8 Types)

### 1. Ocean/Coral World
```javascript
{type:'ocean',bg:0x001a33,fg:0x00ffff,
 agents:[{type:'polyp',ai:'growth',count:20}],
 resources:'nutrients',structures:'coral_branches'}
```

### 2. Space Station
```javascript
{type:'space',bg:0x000000,fg:0xffffff,
 agents:[{type:'engineer',ai:'construct',count:10}],
 resources:'materials',structures:'modules'}
```

### 3. Crystal Cave
```javascript
{type:'crystal',bg:0x1a001a,fg:0xff00ff,
 agents:[{type:'grower',ai:'crystallize',count:15}],
 resources:'minerals',structures:'geodes'}
```

### 4. Garden/Farm
```javascript
{type:'garden',bg:0x1a331a,fg:0x00ff00,
 agents:[{type:'gardener',ai:'tend',count:8}],
 resources:'seeds',structures:'plants'}
```

### 5. Factory Floor
```javascript
{type:'factory',bg:0x2a2a2a,fg:0xff8800,
 agents:[{type:'robot',ai:'assembly',count:25}],
 resources:'parts',structures:'products'}
```

### 6. Ant Colony
```javascript
{type:'colony',bg:0x331a00,fg:0xffaa00,
 agents:[{type:'worker',ai:'pheromone',count:50}],
 resources:'food',structures:'tunnels'}
```

### 7. Archaeological Dig
```javascript
{type:'dig',bg:0x332200,fg:0xaa8844,
 agents:[{type:'excavator',ai:'uncover',count:12}],
 resources:'artifacts',structures:'ruins'}
```

### 8. Abstract Dimension
```javascript
{type:'abstract',bg:0x0a0a0a,fg:0x00ffff,
 agents:[{type:'geometric',ai:'fractal',count:30}],
 resources:'equations',structures:'impossible'}
```

---

## 🔧 Utility Functions

### Repository Scanner
```javascript
scanRepo(){
  return{
    '.git':{type:'core',val:100},
    'src':{type:'code',val:50,files:['index.ts','app.ts']},
    'node_modules':{type:'deps',val:30},
    'package.json':{type:'config',val:20}
  }
}
```

### Agent Spawner
```javascript
spawn(type,x,z){
  let g=type==='miner'?
    new THREE.SphereGeometry(2,8,8):
    new THREE.BoxGeometry(3,3,3);
  let a={
    m:new THREE.Mesh(g,new THREE.MeshLambertMaterial({
      color:this.colors[type]
    })),
    type,x,y:5,z,s:0,i:[],e:100,sp:.5
  };
  a.m.position.set(x,5,z);
  this.s.add(a.m);
  return a;
}
```

---

## 🎯 Usage Pattern

```javascript
// 1. Pick world type
const world = WorldTemplates.ocean;

// 2. Add behaviors
agents.forEach(a => {
  stateMachine(a);
  if(a.s===1) pathfind(a);
  if(a.s===2) collect(a, resources);
  swarm(a, agents);
});

// 3. Generate structures
if(timer%60===0) spawnCluster(x,z,5,10);

// 4. Evolve
if(Math.random()<.001) evolve(bestAgent);
```

---

## 📊 Complexity Levels

**Minimal** (1 agent, 1 behavior)
- Single agent type
- Basic pathfinding
- Simple resource collection
- ~2KB code

**Standard** (2-3 agents, 3-4 behaviors)
- Multiple agent types
- State machines
- Emergent patterns
- ~3-4KB code

**Complex** (4+ agents, 6+ behaviors)
- Swarm intelligence
- Evolution/genetics
- Ecosystem dynamics
- ~4-5KB code

---

## 🚀 Quick Start Recipe

```javascript
// Copy this template and customize:
const W={
  s:new THREE.Scene(),
  A:[], // agents
  R:[], // resources

  init(){
    // 1. Setup scene
    // 2. Scan repo
    // 3. Spawn agents
    // 4. Start loop
  },

  update(){
    this.A.forEach(a=>{
      // Pick behaviors:
      stateMachine(a);
      pathfind(a);
      collect(a);
      build(a);
    });
  }
};
```

---

**Mix these components to create infinite variations!** 🎨✨
