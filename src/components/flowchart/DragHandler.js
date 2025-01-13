'use client';

import { useEffect, useRef, useState } from 'react';

export function useDragAndDrop(containerRef, scale, position) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseDown = (e) => {
      // Only allow dragging from the container itself, not from nodes
      if (e.target.closest('.node')) return;
      
      setIsDragging(true);

      const containerBounds = container.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - containerBounds.left,
        y: e.clientY - containerBounds.top
      });

      initialPosition.current = {
        x: position.x,
        y: position.y
      };

      e.stopPropagation();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const containerBounds = container.getBoundingClientRect();
      const newX = (e.clientX - containerBounds.left - dragOffset.x) / scale;
      const newY = (e.clientY - containerBounds.top - dragOffset.y) / scale;

      const event = new CustomEvent('viewportChange', {
        detail: {
          x: newX,
          y: newY
        }
      });
      container.dispatchEvent(event);

      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
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
  }, [containerRef, isDragging, scale, position]);

  return {
    isDragging
  };
}