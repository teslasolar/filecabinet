// DDI Runner - Document Driven Interface
// Parses and executes markdown files
export class DDIRunner {
  constructor() {
    this.docs = new Map();
    this.context = {};
  }

  async load(path) {
    const response = await fetch(path);
    const markdown = await response.text();
    return this.parse(markdown);
  }

  parse(markdown) {
    const doc = {
      title: '',
      sections: [],
      code: [],
      metadata: {},
      executable: true
    };

    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeType = '';
    let currentSection = null;

    for (let line of lines) {
      // Extract title
      if (line.startsWith('# ') && !doc.title) {
        doc.title = line.slice(2);
        continue;
      }

      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeType = line.slice(3).trim() || 'javascript';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          doc.code.push({
            type: codeType,
            code: codeBuffer.join('\n'),
            executable: codeType === 'javascript'
          });
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
      } else if (line.startsWith('## ')) {
        currentSection = {
          title: line.slice(3),
          content: []
        };
        doc.sections.push(currentSection);
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }

    return doc;
  }

  async execute(doc, context = {}) {
    this.context = { ...this.context, ...context };
    const results = [];

    for (let block of doc.code) {
      if (!block.executable) continue;

      try {
        const func = new Function(...Object.keys(this.context), block.code);
        const result = await func(...Object.values(this.context));
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  render(doc, container) {
    let html = `<div class="ddi-doc">`;
    html += `<h1>${doc.title}</h1>`;

    doc.sections.forEach(section => {
      html += `<section>`;
      html += `<h2>${section.title}</h2>`;
      html += `<div class="content">${section.content.join('<br>')}</div>`;
      html += `</section>`;
    });

    doc.code.forEach((block, i) => {
      html += `<div class="code-block">`;
      html += `<div class="code-header">${block.type}</div>`;
      html += `<pre><code>${this.escape(block.code)}</code></pre>`;
      if (block.executable) {
        html += `<button onclick="window.ddi.runBlock(${i})">▶️ Run</button>`;
      }
      html += `</div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  escape(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    })[m]);
  }
}
