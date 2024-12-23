'use client';

// Shape transformation helper
export const transformToShape = (shape, element, colors) => {
  const bbox = element.getBBox();
  const { x, y, width, height } = bbox;

  switch (shape) {
    case 'circle':
      return {
        type: 'circle',
        cx: x + width/2,
        cy: y + height/2,
        r: Math.max(width, height)/2
      };
    case 'diamond':
      return {
        type: 'polygon',
        points: `${x + width/2},${y} ${x + width},${y + height/2} ${x + width/2},${y + height} ${x},${y + height/2}`
      };
    case 'parallelogram':
      const skew = width * 0.2;
      return {
        type: 'polygon',
        points: `${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`
      };
    case 'hexagon':
      const indent = width * 0.2;
      return {
        type: 'polygon',
        points: `${x + indent},${y} ${x + width - indent},${y} ${x + width},${y + height/2} ${x + width - indent},${y + height} ${x + indent},${y + height} ${x},${y + height/2}`
      };
    case 'roundedRect':
      return {
        type: 'rect',
        x,
        y,
        width,
        height,
        rx: 10,
        ry: 10
      };
    default:
      return {
        type: 'rect',
        x,
        y,
        width,
        height
      };
  }
};

// Node creation helper
export const createNodeElement = (type, position, config = {}) => {
  const { colors = {} } = config;
  const width = 120;
  const height = 60;
  const x = position.x - width/2;
  const y = position.y - height/2;

  // Create node group
  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.setAttribute('class', 'node draggable');
  nodeGroup.setAttribute('id', `node-${Date.now()}`);
  nodeGroup.setAttribute('transform', `translate(${x},${y})`);

  // Create shape based on type
  const shapeData = transformToShape(type, { getBBox: () => ({ x: 0, y: 0, width, height }) }, colors);
  const shape = document.createElementNS("http://www.w3.org/2000/svg", shapeData.type);
  
  // Apply shape attributes
  Object.entries(shapeData).forEach(([key, value]) => {
    if (key !== 'type') {
      shape.setAttribute(key, value);
    }
  });

  // Apply styles
  shape.style.fill = colors.nodeBackground || '#ffffff';
  shape.style.stroke = colors.nodeBorder || '#000000';
  shape.style.strokeWidth = '2';

  // Create text element
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute('x', width/2);
  text.setAttribute('y', height/2);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('alignment-baseline', 'middle');
  text.textContent = 'New Node';
  text.style.fill = colors.text || '#000000';
  text.style.fontSize = '14px';
  text.style.fontFamily = config.font || 'system-ui';

  // Add elements to group
  nodeGroup.appendChild(shape);
  nodeGroup.appendChild(text);

  return nodeGroup;
};

// Update node styles helper
export const updateNodeStyles = (node, config = {}) => {
  const { colors = {} } = config;
  const shape = node.querySelector('rect, circle, polygon');
  const text = node.querySelector('text');

  if (shape) {
    shape.style.fill = colors.nodeBackground || '#ffffff';
    shape.style.stroke = colors.nodeBorder || '#000000';
    shape.style.strokeWidth = '2';
  }

  if (text) {
    text.style.fill = colors.text || '#000000';
    text.style.fontSize = config.fontSize ? `${config.fontSize}px` : '14px';
    text.style.fontFamily = config.font || 'system-ui';
  }
};

// Shape detection helper
export const detectNodeShape = (node) => {
  const shape = node.querySelector('rect, circle, polygon');
  if (!shape) return 'rectangle';

  const tagName = shape.tagName.toLowerCase();
  if (tagName === 'circle') return 'circle';
  
  if (tagName === 'polygon') {
    const points = shape.getAttribute('points')?.split(' ').length;
    if (points === 4) return 'diamond';
    if (points === 6) return 'hexagon';
    return 'parallelogram';
  }
  
  const rx = parseFloat(shape.getAttribute('rx') || 0);
  return rx > 0 ? 'roundedRect' : 'rectangle';
};

// Node position helper
export const getNodePosition = (node) => {
  const transform = node.getAttribute('transform');
  const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
  if (!match) return { x: 0, y: 0 };
  
  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2])
  };
};

// Node bounds helper
export const getNodeBounds = (node) => {
  const shape = node.querySelector('rect, circle, polygon');
  if (!shape) return null;

  const bbox = shape.getBBox();
  const position = getNodePosition(node);

  return {
    x: position.x + bbox.x,
    y: position.y + bbox.y,
    width: bbox.width,
    height: bbox.height
  };
};

// Connection point calculation helper
export const calculateConnectionPoints = (sourceNode, targetNode) => {
  const sourceBounds = getNodeBounds(sourceNode);
  const targetBounds = getNodeBounds(targetNode);
  if (!sourceBounds || !targetBounds) return null;

  const sourceCenter = {
    x: sourceBounds.x + sourceBounds.width/2,
    y: sourceBounds.y + sourceBounds.height/2
  };

  const targetCenter = {
    x: targetBounds.x + targetBounds.width/2,
    y: targetBounds.y + targetBounds.height/2
  };

  return {
    source: sourceCenter,
    target: targetCenter
  };
};