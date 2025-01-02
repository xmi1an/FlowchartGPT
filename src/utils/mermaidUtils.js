// src/utils/mermaidUtils.js

// Keep all existing functions
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

export function getShapeSymbol(shape) {
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

// New functions for edit feature
export function analyzeMermaidCode(code) {
  const lines = code.split('\n');
  const graphTypeMatch = lines[0].match(/graph\s+(TD|LR|RL|BT)/);
  
  return {
      graphType: graphTypeMatch ? graphTypeMatch[1] : 'TD',
      nodes: extractNodes(lines),
      connections: extractConnections(lines),
      styles: extractStyles(lines)
  };
}

function extractNodes(lines) {
  const nodes = [];
  const nodeRegex = /^\s*(\w+)([\[\(\{\|].*[\]\)\}\|])/;
  
  lines.forEach(line => {
      const match = line.match(nodeRegex);
      if (match) {
          const node = parseNode(line);
          if (node) nodes.push(node);
      }
  });
  
  return nodes;
}

function extractConnections(lines) {
  const connections = [];
  const connectionRegex = /(\w+)\s*-->([\|\}].*?[\|\}])?\s*(\w+)/g;
  
  lines.forEach(line => {
      let match;
      while ((match = connectionRegex.exec(line)) !== null) {
          connections.push({
              from: match[1],
              to: match[3],
              label: match[2] ? match[2].replace(/[\|\}]/g, '') : ''
          });
      }
  });
  
  return connections;
}

function extractStyles(lines) {
  const styles = [];
  const styleRegex = /style\s+(\w+)\s+(.+)$/;
  
  lines.forEach(line => {
      const match = line.match(styleRegex);
      if (match) {
          styles.push({
              nodeId: match[1],
              style: match[2]
          });
      }
  });
  
  return styles;
}

export function modifyFlowchart(originalCode, modifications) {
  let code = originalCode;
  
  if (modifications.addNode) {
      code = addNode(code, modifications.addNode);
  }
  
  if (modifications.removeNode) {
      code = removeNode(code, modifications.removeNode);
  }
  
  if (modifications.updateConnections) {
      code = updateConnections(code, modifications.updateConnections);
  }
  
  if (modifications.updateStyles) {
      code = updateStyles(code, modifications.updateStyles);
  }
  
  return code;
}

function addNode(code, nodeDetails) {
  const lines = code.split('\n');
  const newNodeLine = `    ${nodeDetails.id}${getShapeSymbol(nodeDetails.shape)}${nodeDetails.text}`;
  
  // Find the last node definition and insert after it
  let lastNodeIndex = lines.length - 1;
  for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^\s*\w+[\[\(\{\|]/)) {
          lastNodeIndex = i;
          break;
      }
  }
  
  lines.splice(lastNodeIndex + 1, 0, newNodeLine);
  return lines.join('\n');
}

function removeNode(code, nodeId) {
  const lines = code.split('\n');
  return lines
      .filter(line => !line.includes(nodeId))
      .join('\n');
}

function updateConnections(code, connectionUpdates) {
  const lines = code.split('\n');
  const updatedLines = lines.map(line => {
      let updatedLine = line;
      connectionUpdates.forEach(update => {
          const connectionRegex = new RegExp(
              `${update.from}\\s*-->\\s*${update.to}`, 'g'
          );
          if (connectionRegex.test(line)) {
              updatedLine = `    ${update.from} --> ${update.label ? `|${update.label}|` : ''} ${update.to}`;
          }
      });
      return updatedLine;
  });
  return updatedLines.join('\n');
}

function updateStyles(code, styleUpdates) {
  const lines = code.split('\n');
  styleUpdates.forEach(update => {
      const styleIndex = lines.findIndex(line => 
          line.includes(`style ${update.nodeId}`)
      );
      
      const newStyle = `style ${update.nodeId} ${update.style}`;
      
      if (styleIndex !== -1) {
          lines[styleIndex] = newStyle;
      } else {
          lines.push(newStyle);
      }
  });
  return lines.join('\n');
}