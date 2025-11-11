# 🗄️ File Cabinet - 3D Visualizations

Interactive 3D visualizations and AI/ML tools built with Three.js. Available in two versions:
- **Solo**: Single-file HTMLs (all-in-one)
- **Modular**: Split into files <250 tokens each

## 🚀 Quick Start

### Local Development
```bash
# Just open any HTML file in your browser!
open solo/clustering.html

# Or start a local server
python -m http.server 8000
# Visit http://localhost:8000
```

### GitHub Pages Deployment
1. Push to your repository
2. Go to Settings → Pages
3. Set source to `main` branch `/` (root)
4. Visit `https://yourusername.github.io/filecabinet/`

## 📂 Project Structure

```
filecabinet/
├── index.html              # Landing page
├── solo/                   # Single-file versions (26 apps)
│   ├── index.html         # Solo apps browser
│   ├── clustering.html    # Example: All-in-one
│   └── ...
├── modular/                # Modular versions (<250 tokens/file)
│   ├── index.html         # Modular apps browser
│   └── clustering/        # Example modular app
│       ├── index.html     # Structure (~50 tokens)
│       ├── style.css      # Styles (~150 tokens)
│       ├── core.js        # Initialization (~200 tokens)
│       ├── clustering.js  # Algorithms (~250 tokens)
│       └── viz.js         # 3D rendering (~200 tokens)
├── assets/
│   ├── css/main.css       # Shared styles
│   ├── js/                # Shared scripts (future)
│   └── data/              # Data files (future)
├── scan.js                # Error scanner CLI
└── README.md
```

## 🎨 26 Projects

### AI/ML Tools (12)
- 🎨 **Clustering** - K-Means & DBSCAN algorithms
- 🎭 **GAN Training** - Generator vs Discriminator
- 👁️ **Attention Mechanism** - Transformer Q-K-V visualization
- 🧠 **Neural Training** - Backpropagation visualization
- 🎮 **Reinforcement Learning** - Q-learning agent
- 📉 **Gradient Descent** - SGD, Momentum, Adam optimizers
- 🔍 **Feature Extraction** - CNN layers visualization
- 🧬 **Model Evolution** - Genetic algorithm AutoML
- 🔄 **Transfer Learning** - Fine-tuning visualization
- 🌳 **Ensemble Methods** - Random forest & voting
- ⚙️ **Data Pipeline** - ETL processing stages
- 🎯 **Hyperparameter Search** - Grid, Random, Bayesian

### Generative Worlds (3)
- 🧱 **Voxel World** - Autonomous agents building
- 🏙️ **Procedural City** - Cyberpunk city generator
- 🌿 **Ecosystem** - Miner/builder agent society

### Compressed Visualizations (4)
- 🌳 **Fractal Tree** - L-system growth (3.6KB)
- 🌪️ **Vortex** - Tornado physics (3.2KB)
- ⚛️ **Quantum Field** - Wave interference (3.7KB)
- 🔮 **Matrix Cube** - Data rain (3.8KB)

### 3D Visualizations (4)
- 🧠 **Neural Network 3D** - Force-directed graph
- 🌌 **Galaxy Explorer 3D** - Solar system metaphor
- ⚡ **Particle Swarm 3D** - Swarm intelligence
- 🧬 **DNA Helix 3D** - Double helix structure

### Tools (3)
- 🏭 **Virtual Repository 3D** - ISA-95 hierarchy with AMRs
- 🏭 **Agent World Factory** - Meta-generator system
- 🔍 **Error Scanner** - State machine validation

## 🔧 Modular Architecture

Each modular app follows this pattern:

### File Breakdown
1. **index.html** (~50 tokens)
   - HTML structure only
   - Links to CSS and JS modules

2. **style.css** (~150 tokens)
   - All styling
   - Responsive design

3. **core.js** (~200 tokens)
   - App initialization
   - Main render loop
   - Event handling

4. **algorithms.js** (~250 tokens)
   - Core algorithms (K-Means, DBSCAN, etc.)
   - Business logic

5. **viz.js** (~200 tokens)
   - Three.js scene setup
   - 3D rendering
   - Camera controls

### Benefits
- ✅ Each file under 250 tokens
- ✅ Easy to understand & modify
- ✅ Modular and reusable
- ✅ Works with ES6 modules
- ✅ GitHub Pages compatible

## 🧪 Validation

Run the error scanner to validate all files:

```bash
# Node.js scanner
node scan.js

# Or open the web scanner
open solo/error-scanner.html
```

## 📊 Stats

- **Total Projects**: 26
- **AI/ML Tools**: 12
- **Solo Files**: 26 single HTMLs
- **Modular Apps**: 1 (clustering) + more coming
- **Code Validation**: ✅ 0 errors, 5 warnings
- **File Sizes**: 3.2KB - 34KB (solo), <250 tokens per file (modular)

## 🛠️ Tech Stack

- **Three.js** r128 - 3D rendering
- **Vanilla JS** - No frameworks
- **CSS3** - Modern styling
- **ES6 Modules** - For modular versions
- **HTML5** - Semantic markup

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Want to add more modular versions? Follow this pattern:

1. Create `modular/yourapp/` directory
2. Split into files <250 tokens each
3. Follow naming: `index.html`, `style.css`, `core.js`, etc.
4. Add to `modular/index.html`
5. Submit PR!

---

**Made with ❤️ using Three.js and pure mathematics**
