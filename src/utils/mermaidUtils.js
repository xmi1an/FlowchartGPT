// src/utils/mermaidUtils.js

export function updateNodeInMermaid(mermaidCode, nodeId, updates) {
    const lines = mermaidCode.split('\n');
    const updatedLines = lines.map(line => {
      // Check if this line contains our node
      if (line.includes(nodeId)) {
        // Keep the connections but update the node definition
        const connections = line.match(/-->.*$/)?.[0] || '';
        const nodeShape = getShapeSymbol(updates.shape);
        const color = updates.color ? `,color:${updates.color}` : '';
        const fontSize = updates.fontSize ? `,fontSize:${updates.fontSize}px` : '';
        
        // Rebuild the node definition
        return `    ${nodeId}${nodeShape}${updates.text}${color}${fontSize}${connections}`;
      }
      return line;
    });
  
    return updatedLines.join('\n');
  }
  
  function getShapeSymbol(shape) {
    switch (shape) {
      case 'rectangle': return '[';
      case 'roundedRect': return '(';
      case 'diamond': return '{';
      case 'circle': return '((';
      case 'parallelogram': return '[/';
      case 'hexagon': return '{{';
      default: return '[';
    }
  }
  
  export function parseNode(nodeDefinition) {
    // Extract node ID, shape, text, and style
    const matches = nodeDefinition.match(/(\w+)([\[\(\{\|].*[\]\)\}\|])/);
    if (!matches) return null;
  
    const [, id, fullShape] = matches;
    const text = fullShape.match(/[\[\(\{\|](.*?)[\]\)\}\|]/)?.[1] || '';
    const color = fullShape.match(/,color:(#[0-9a-fA-F]{6})/)?.[1];
    const fontSize = fullShape.match(/,fontSize:(\d+)px/)?.[1];
  
    return {
      id,
      text,
      color,
      fontSize: fontSize ? parseInt(fontSize) : undefined,
      shape: determineShape(fullShape)
    };
  }
  
  function determineShape(shape) {
    if (shape.startsWith('[[')) return 'rectangle';
    if (shape.startsWith('((')) return 'circle';
    if (shape.startsWith('{{')) return 'hexagon';
    if (shape.startsWith('{')) return 'diamond';
    if (shape.startsWith('(/')) return 'parallelogram';
    if (shape.startsWith('(')) return 'roundedRect';
    return 'rectangle';
  }