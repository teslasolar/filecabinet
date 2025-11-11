# 📚 Document Driven Interface (DDI)

Execute markdown files as programs in your browser! DDI turns documentation into executable code.

## 🎯 Concept

Traditional code:
- Code in `.js` files
- Documentation in `.md` files
- Separate and often out of sync

**DDI approach:**
- Everything in `.md` files
- Documentation AND code together
- Code blocks are executable
- Self-documenting programs

## 🚀 Usage

### In Browser (GitHub Pages)
```
1. Open ddi/index.html
2. Select a DDI file from sidebar
3. Click ▶️ Run on any code block
4. Or click "Run All" to execute entire document
```

### Local Testing
```bash
# Start server
python -m http.server 8000

# Visit
http://localhost:8000/ddi/
```

## 📝 Writing DDI Files

### File Structure
```markdown
# Title
*Brief description*

## Section 1
Explanation of what this does...

```javascript
// Executable code block
function example() {
  return "Hello DDI!";
}
```

## Section 2
More documentation...

```javascript
// Another executable block
const result = example();
console.log(result);
```
```

### Code Block Rules

1. **JavaScript blocks** are executable
   ```javascript
   // This will run
   ```

2. **Other languages** are display-only
   ```python
   # This won't run (browser limitation)
   ```

3. **Blocks execute in order**
   - Each block can use functions from previous blocks
   - Variables are shared via `window` object

4. **Token limit**: Keep each block under 250 tokens

## 🎨 Example: Clustering DDI

```markdown
# Clustering

## Configuration
```javascript
const config = {
  points: 100,
  clusters: 5
};
window.config = config;
```

## Algorithm
```javascript
function cluster(points) {
  // Implementation
}
window.cluster = cluster;
```

## Execute
```javascript
cluster(window.config.points);
```
```

## ✨ Features

- ✅ **Self-documenting**: Code and docs in one file
- ✅ **Executable**: Run code blocks individually
- ✅ **Interactive**: Live console output
- ✅ **3D Ready**: Three.js available globally
- ✅ **GitHub Pages**: Works without server
- ✅ **Token-optimized**: Encourages small, focused blocks
- ✅ **Shareable**: One file contains everything

## 📂 File Organization

```
ddi/
├── index.html          # DDI browser/runner
├── runner.js           # Core DDI engine
├── README.md           # This file
└── examples/
    ├── clustering.md   # K-Means & DBSCAN
    └── ... (more)
```

## 🔧 API Reference

### DDIRunner Class

```javascript
const runner = new DDIRunner();

// Load and parse markdown
const doc = await runner.load('path/to/file.md');

// Execute all code blocks
const results = await runner.execute(doc, context);

// Render to HTML
runner.render(doc, container);
```

### Document Structure

```javascript
{
  title: string,
  sections: [{
    title: string,
    content: string[]
  }],
  code: [{
    type: string,
    code: string,
    executable: boolean
  }],
  metadata: object
}
```

## 🎯 Use Cases

1. **Interactive Tutorials**
   - Explain concepts
   - Run examples inline
   - See results immediately

2. **API Documentation**
   - Document endpoints
   - Include working examples
   - Test API calls live

3. **Algorithm Explanations**
   - Describe algorithm
   - Show implementation
   - Visualize results

4. **Literate Programming**
   - Code as narrative
   - Explain thinking
   - Executable story

## 🚧 Limitations

1. **Browser-only JavaScript**
   - No Node.js APIs
   - No file system access
   - No server-side execution

2. **Sequential Execution**
   - Blocks run in order
   - Share global scope
   - Can't run in parallel

3. **No Syntax Highlighting** (yet)
   - Plain text rendering
   - Could add with highlight.js

## 🔮 Future Ideas

- [ ] Syntax highlighting
- [ ] Code editing in browser
- [ ] Save modified DDI files
- [ ] Import other DDI files
- [ ] Collaborative editing
- [ ] Version control integration
- [ ] TypeScript support
- [ ] WASM support

## 📖 Philosophy

> "The best documentation is code.
> The best code is documentation.
> DDI is both."

DDI treats documentation as a first-class citizen. By making docs executable, we ensure they're always accurate and always useful.

## 🤝 Contributing

Want to create more DDI examples? Follow this pattern:

1. Create `examples/yourname.md`
2. Follow the structure above
3. Keep code blocks under 250 tokens
4. Add to file list in `index.html`
5. Test with "Run All"

---

**Made with 📚 using the Document Driven Interface pattern**
