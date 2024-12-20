// src/components/flowchart/DragHandler.js
'use client';

import { useEffect, useRef, useState } from 'react';

export function useDragAndDrop(containerRef, scale, position) {
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const initialPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseDown = (e) => {
      const node = e.target.closest('.node');
      if (!node || !node.classList.contains('draggable')) return;

      setIsDragging(true);
      setDraggedNode(node);

      const nodeBounds = node.getBoundingClientRect();
      const containerBounds = container.getBoundingClientRect();

      // Calculate offset relative to node position
      setDragOffset({
        x: e.clientX - nodeBounds.left,
        y: e.clientY - nodeBounds.top
      });

      // Store initial position
      const transform = node.getAttribute('transform');
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        initialPosition.current = {
          x: parseFloat(match[1]),
          y: parseFloat(match[2])
        };
      }

      e.stopPropagation();
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !draggedNode) return;

      const containerBounds = container.getBoundingClientRect();
      const newX = (e.clientX - containerBounds.left - dragOffset.x) / scale;
      const newY = (e.clientY - containerBounds.top - dragOffset.y) / scale;

      // Apply scale and position offset
      const adjustedX = (newX - position.x) / scale;
      const adjustedY = (newY - position.y) / scale;

      draggedNode.setAttribute(
        'transform',
        `translate(${adjustedX},${adjustedY})`
      );

      e.preventDefault();
    };

    const handleMouseUp = (e) => {
      if (!isDragging || !draggedNode) return;

      // Calculate final position
      const transform = draggedNode.getAttribute('transform');
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        const finalX = parseFloat(match[1]);
        const finalY = parseFloat(match[2]);

        // Emit position change if moved
        if (
          finalX !== initialPosition.current.x ||
          finalY !== initialPosition.current.y
        ) {
          const event = new CustomEvent('nodePositionChange', {
            detail: {
              nodeId: draggedNode.id,
              x: finalX,
              y: finalY
            }
          });
          container.dispatchEvent(event);
        }
      }

      setIsDragging(false);
      setDraggedNode(null);
      setDragOffset({ x: 0, y: 0 });
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, isDragging, draggedNode, scale, position]);

  return {
    isDragging,
    draggedNode
  };
}