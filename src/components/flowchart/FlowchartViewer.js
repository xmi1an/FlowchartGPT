// src/components/flowchart/FlowchartViewer.js
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Download, Grid } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Theme configurations
const themeColors = {
  default: {
    nodeBackground: '#ffffff',
    nodeBorder: '#000000',
    text: '#000000',
    lineColor: '#000000'
  },
  ocean: {
    nodeBackground: '#dbeafe',
    nodeBorder: '#2563eb',
    text: '#1e3a8a',
    lineColor: '#2563eb'
  },
  forest: {
    nodeBackground: '#dcfce7',
    nodeBorder: '#16a34a',
    text: '#166534',
    lineColor: '#16a34a'
  },
  sunset: {
    nodeBackground: '#ffedd5',
    nodeBorder: '#ea580c',
    text: '#9a3412',
    lineColor: '#ea580c'
  },
  purple: {
    nodeBackground: '#f3e8ff',
    nodeBorder: '#9333ea',
    text: '#6b21a8',
    lineColor: '#9333ea'
  }
};

// Toolbar Component
function Toolbar({ 
  onZoom, 
  onReset, 
  onExport, 
  onToggleGrid,
  showGrid,
  scale 
}) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-1 flex gap-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoom(0.1)}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => onZoom(-0.1)}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Reset View"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-md ${showGrid ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Export as SVG"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 pr-2">
        <span className="text-sm text-gray-500">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}

function determineNodeShape(node) {
  const element = node.querySelector('rect, circle, polygon');
  if (!element) return 'rectangle';
  
  switch (element.tagName.toLowerCase()) {
    case 'circle': return 'circle';
    case 'polygon': return 'diamond';
    default:
      const rx = element.getAttribute('rx');
      return rx ? 'roundedRect' : 'rectangle';
  }
}
// Continue from previous part...

export function FlowchartViewer({ code, config, onNodeSelect }) {
    const containerRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
  
    const handleMouseDown = (e) => {
      if (e.target.closest('.node') || e.target.closest('.toolbar')) return;
      if (e.button === 0) {
        setIsPanning(true);
        setStartPan({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }
    };
  
    const handleMouseMove = (e) => {
      if (isPanning) {
        setPosition({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y
        });
      }
    };
  
    const handleMouseUp = () => {
      setIsPanning(false);
    };
  
    const handleZoom = (delta) => {
      setScale(prev => Math.min(Math.max(0.5, prev + delta), 2));
    };
  
    const resetView = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
  
    const handleExport = async () => {
      try {
        const svgElement = containerRef.current?.querySelector('svg');
        if (!svgElement) return;
  
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'flowchart.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Flowchart exported successfully!');
      } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export flowchart');
      }
    };
  
    useEffect(() => {
      if (!containerRef.current || !code) return;
  
      const initializeMermaid = async () => {
        try {
          const cleanCode = code.replace(/```mermaid\n?/g, '').replace(/```/g, '').trim();
          const colors = themeColors[config.theme] || themeColors.default;
  
          mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            flowchart: {
              curve: 'basis',
              padding: 20,
              nodeSpacing: 50,
              rankSpacing: 50,
              defaultRenderer: 'flowchart',
              htmlLabels: true,
            },
            themeVariables: {
              primaryColor: colors.nodeBackground,
              primaryBorderColor: colors.nodeBorder,
              primaryTextColor: colors.text,
              lineColor: colors.lineColor,
              fontFamily: config.font || 'inter',
            }
          });
  
          const wrapper = containerRef.current.querySelector('.flowchart-wrapper');
          if (!wrapper) return;
  
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, cleanCode);
          wrapper.innerHTML = svg;
  
          // Apply theme colors directly to SVG elements
          const svgElement = wrapper.querySelector('svg');
          if (svgElement) {
            // Style nodes
            const nodes = svgElement.querySelectorAll('.node');
            nodes.forEach(node => {
              const shapes = node.querySelectorAll('rect, circle, polygon');
              shapes.forEach(shape => {
                shape.style.fill = colors.nodeBackground;
                shape.style.stroke = colors.nodeBorder;
                shape.style.strokeWidth = '2px';
              });
  
              const texts = node.querySelectorAll('text');
              texts.forEach(text => {
                text.style.fill = colors.text;
                text.style.fontFamily = config.font;
              });
  
              // Add click handler
              node.style.cursor = 'pointer';
              node.addEventListener('click', (e) => {
                if (!isPanning) {
                  e.stopPropagation();
                  nodes.forEach(n => n.classList.remove('selected'));
                  node.classList.add('selected');
                  onNodeSelect({
                    id: node.id,
                    text: node.querySelector('text')?.textContent || '',
                    shape: determineNodeShape(node),
                    element: node
                  });
                }
              });
            });
  
            // Style edges
            const edges = svgElement.querySelectorAll('.edge');
            edges.forEach(edge => {
              const paths = edge.querySelectorAll('path');
              paths.forEach(path => {
                path.style.stroke = colors.lineColor;
                path.style.strokeWidth = '2px';
              });
  
              const texts = edge.querySelectorAll('text');
              texts.forEach(text => {
                text.style.fill = colors.text;
                text.style.fontFamily = config.font;
              });
            });
  
            // Style markers (arrowheads)
            const markers = svgElement.querySelectorAll('marker path');
            markers.forEach(marker => {
              marker.style.fill = colors.lineColor;
              marker.style.stroke = colors.lineColor;
            });
          }
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error);
          toast.error('Failed to render flowchart');
        }
      };
  
      initializeMermaid();
    }, [code, config, isPanning]);
  
    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;
  
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
  
      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isPanning, position, startPan]);
  
    return (
      <div className="space-y-4">
        <Toolbar
          onZoom={handleZoom}
          onReset={resetView}
          onExport={handleExport}
          scale={scale}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
        />
  
        <div 
          ref={containerRef}
          className="relative overflow-hidden bg-white rounded-lg border"
          style={{ height: '600px', cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}
  
          <div
            className="flowchart-wrapper absolute inset-0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
          />
        </div>
  
        <style jsx global>{`
          .node.selected rect,
          .node.selected circle,
          .node.selected polygon {
            stroke-width: 3px;
          }
          
          .node:hover rect,
          .node:hover circle,
          .node:hover polygon {
            filter: brightness(0.95);
          }
        `}</style>
      </div>
    );
  }