// src/utils/flowchart-utils.js
'use client';

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

export const createNodeElement = (type, position, config) => {
  const { colors } = config;
  const width = 120;
  const height = 60;
  const x = position.x - width/2;
  const y = position.y - height/2;

  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.setAttribute('class', 'node draggable');
  nodeGroup.setAttribute('transform', `translate(${x},${y})`);

  // Create shape based on type
  const shapeData = transformToShape(type, { getBBox: () => ({ x: 0, y: 0, width, height }) }, colors);
  const shape = document.createElementNS("http://www.w3.org/2000/svg", shapeData.type);
  
  Object.entries(shapeData).forEach(([key, value]) => {
    if (key !== 'type') {
      shape.setAttribute(key, value);
    }
  });

  shape.style.fill = colors.nodeBackground;
  shape.style.stroke = colors.nodeBorder;
  shape.style.strokeWidth = '2';

  // Add text element
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute('x', width/2);
  text.setAttribute('y', height/2);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('alignment-baseline', 'middle');
  text.textContent = 'New Node';
  text.style.fill = colors.text;
  text.style.fontSize = '14px';

  nodeGroup.appendChild(shape);
  nodeGroup.appendChild(text);

  return nodeGroup;
};

export const updateNodeStyles = (node, config) => {
  const { colors } = config;
  const shape = node.querySelector('rect, circle, polygon');
  const text = node.querySelector('text');

  if (shape) {
    shape.style.fill = colors.nodeBackground;
    shape.style.stroke = colors.nodeBorder;
  }

  if (text) {
    text.style.fill = colors.text;
  }
};