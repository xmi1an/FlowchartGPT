// src/lib/flowchart-generator.js
export function processUserInput(text) {
    // Split into sentences or bullet points
    const steps = text.split(/[.•]/g).filter(Boolean);
    
    // Start building mermaid syntax
    let mermaidCode = 'graph TD\n';
    let nodeId = 0;
    
    // Track nodes for connections
    const nodes = [];
    
    steps.forEach((step, index) => {
      const currentId = `node${nodeId++}`;
      
      // Determine node type based on content
      let nodeType = 'default';
      if (step.match(/(if|when|check)/i)) {
        nodeType = 'decision';
      } else if (step.match(/(start|begin)/i)) {
        nodeType = 'start';
      } else if (step.match(/(end|finish)/i)) {
        nodeType = 'end';
      }
      
      // Add node to mermaid syntax
      switch (nodeType) {
        case 'decision':
          mermaidCode += `    ${currentId}{${step.trim()}}\n`;
          break;
        case 'start':
        case 'end':
          mermaidCode += `    ${currentId}([${step.trim()}])\n`;
          break;
        default:
          mermaidCode += `    ${currentId}[${step.trim()}]\n`;
      }
      
      // Connect to previous node if exists
      if (nodes.length > 0) {
        mermaidCode += `    ${nodes[nodes.length - 1]} --> ${currentId}\n`;
      }
      
      nodes.push(currentId);
    });
    
    return mermaidCode;
  }