# 🎨 Clustering (Modular Version)

K-Means and DBSCAN clustering algorithms in 3D, split into files under 250 tokens each.

## 📊 Token Counts

All files under 250 tokens:

- ✅ **index.html**: ~68 tokens - HTML structure
- ✅ **style.css**: ~137 tokens - All styling
- ✅ **ui.js**: ~89 tokens - UI updates & events
- ✅ **kmeans.js**: ~110 tokens - K-Means main algorithm
- ✅ **kmeans-helpers.js**: ~202 tokens - K-Means helpers
- ✅ **points.js**: ~153 tokens - Point generation
- ✅ **viz.js**: ~184 tokens - Three.js rendering
- ✅ **core.js**: ~210 tokens - App initialization
- ✅ **dbscan.js**: ~214 tokens - DBSCAN algorithm

**Total**: 9 files, all under 250 tokens

## 🏗️ Architecture

```
clustering/
├── index.html          # Structure only
├── style.css           # All CSS
├── core.js            # Main app class & init
├── points.js          # Point generation
├── kmeans.js          # K-Means algorithm
├── kmeans-helpers.js  # K-Means utilities
├── dbscan.js          # DBSCAN algorithm
├── viz.js             # Three.js scene
└── ui.js              # UI updates
```

## 🔧 How It Works

### 1. **index.html** - Entry Point
- Minimal HTML structure
- Links CSS and JS modules
- Canvas for 3D rendering
- UI elements (HUD, buttons)

### 2. **core.js** - Application Core
```javascript
import { spawnPoints } from './points.js';
import { KMeans } from './kmeans.js';
import { DBSCAN } from './dbscan.js';
// ... manages the whole app
```

### 3. **Algorithms**
- **kmeans.js** + **kmeans-helpers.js**: K-Means clustering
- **dbscan.js**: Density-based clustering

### 4. **Visualization**
- **viz.js**: Three.js scene setup & rendering
- **points.js**: 3D point generation

### 5. **UI**
- **ui.js**: Stats updates & event listeners
- **style.css**: Visual styling

## 🚀 Usage

Just open `index.html` in a modern browser with ES6 module support.

Or use a local server:
```bash
python -m http.server 8000
# Visit http://localhost:8000/modular/clustering/
```

## 🎮 Controls

- **🎯 K-Means**: Run K-Means clustering
- **🔍 DBSCAN**: Run density-based clustering
- **➕ Points**: Add 20 more points
- **🔄 Reset**: Reset scene

## 📝 Benefits

1. **Easy to understand**: Each file under 250 tokens
2. **Modular**: Change one algorithm without touching others
3. **Reusable**: Import functions in other projects
4. **Maintainable**: Clear separation of concerns
5. **Educational**: Learn from small, focused files

## 🧠 Algorithms

### K-Means
1. Initialize random centroids
2. Assign points to nearest centroid
3. Move centroids to cluster mean
4. Repeat until convergence

### DBSCAN
1. Mark core points (minPts neighbors within eps)
2. Expand clusters from core points
3. Mark noise points (gray)
4. Color-code clusters

## 🎨 3D Rendering

- **Points**: White spheres (1 unit radius)
- **Centroids**: Colored boxes (5x5x5 units)
- **Clusters**: Points colored by cluster
- **Camera**: Orbits around origin
- **Lights**: Ambient + point lights
