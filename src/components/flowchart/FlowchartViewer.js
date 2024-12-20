'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Grid, ArrowLeft, 
  Lightbulb, Edit, Plus, Square, Circle, Diamond, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { themeColors } from '@/utils/theme';
import { SideSummary } from './SideSummary';
import { motion, AnimatePresence } from 'framer-motion';

function NodeEditor({ node, onClose, onUpdate }) {
  const [text, setText] = useState(node?.text || '');
  const [shape, setShape] = useState(node?.shape || 'rectangle');

  const shapes = [
    { id: 'rectangle', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'diamond', icon: Diamond }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-4 top-4 w-72 bg-white rounded-lg shadow-lg border p-4 space-y-4 z-50"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Edit Node</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Shape</label>
          <div className="flex gap-2">
            {shapes.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setShape(id)}
                className={`p-2 rounded-md ${
                  shape === id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onUpdate({ ...node, text, shape });
            onClose();
          }}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </motion.div>
  );
}

function Toolbar({ 
  onZoom, 
  onReset, 
  onExport, 
  onToggleGrid,
  onBack,
  showGrid,
  scale,
  onExplain,
  showSummary,
  summaryLoading,
  onAddNode
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg shadow-sm p-1 flex gap-2"
    >
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Back to Editor"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-px h-8 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoom(0.1)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => onZoom(-0.1)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <span className="px-2 text-sm text-gray-500 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Reset View"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={onAddNode}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Add Node"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-md transition-colors ${showGrid ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Export as SVG"
        >
          <Download size={20} />
        </button>
        <button
          onClick={onExplain}
          disabled={summaryLoading}
          className={`p-2 rounded-md transition-colors ${
            showSummary ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'
          } ${summaryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Explain Flowchart"
        >
          <Lightbulb size={20} className={summaryLoading ? 'animate-pulse' : ''} />
        </button>
      </div>
    </motion.div>
  );
}
export function FlowchartViewer({ code, config, onBack }) {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  const generateSummary = async () => {
    if (!code) return;

    setSummaryLoading(true);
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: code,
          type: 'summary'
        })
      });

      if (!response.ok) throw new Error('Failed to generate explanation');

      const data = await response.json();
      setSummary(data.summary);
      setKeyPoints(data.keyPoints);
      setShowSummary(true);
    } catch (error) {
      console.error('Summary error:', error);
      toast.error('Failed to generate explanation');
    } finally {
      setSummaryLoading(false);
    }
  };

  const updateNode = (updatedNode) => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement || !selectedNode) return;

    const nodeElement = svgElement.querySelector(`#${selectedNode.id}`);
    if (!nodeElement) return;

    // Update node text
    const textElement = nodeElement.querySelector('text');
    if (textElement) {
      textElement.textContent = updatedNode.text;
    }

    // Update node shape based on type
    const shapeElement = nodeElement.querySelector('rect, circle, polygon');
    if (shapeElement) {
      const colors = themeColors[config.theme] || themeColors.default;
      
      shapeElement.style.fill = colors.nodeBackground;
      shapeElement.style.stroke = colors.nodeBorder;
      
      if (updatedNode.shape === 'circle') {
        const cx = parseFloat(shapeElement.getAttribute('x')) + parseFloat(shapeElement.getAttribute('width')) / 2;
        const cy = parseFloat(shapeElement.getAttribute('y')) + parseFloat(shapeElement.getAttribute('height')) / 2;
        const r = Math.min(parseFloat(shapeElement.getAttribute('width')), parseFloat(shapeElement.getAttribute('height'))) / 2;
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.style.fill = colors.nodeBackground;
        circle.style.stroke = colors.nodeBorder;
        
        shapeElement.replaceWith(circle);
      }
      // Add other shape transformations as needed
    }

    setSelectedNode(null);
    setShowNodeEditor(false);
    toast.success('Node updated successfully');
  };

  const addNewNode = () => {
    const wrapper = containerRef.current?.querySelector('.flowchart-wrapper');
    if (!wrapper) return;

    const newNodeId = `node-${Date.now()}`;
    const colors = themeColors[config.theme] || themeColors.default;

    // Create a new node element
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodeGroup.setAttribute('class', 'node');
    nodeGroup.setAttribute('id', newNodeId);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '50');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.style.fill = colors.nodeBackground;
    rect.style.stroke = colors.nodeBorder;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = 'New Node';
    text.style.fill = colors.text;
    text.style.fontFamily = config.font || 'inter';

    nodeGroup.appendChild(rect);
    nodeGroup.appendChild(text);

    // Add the node to the SVG
    const svgElement = wrapper.querySelector('svg');
    if (svgElement) {
      const firstNode = svgElement.querySelector('.node');
      if (firstNode) {
        firstNode.parentNode.insertBefore(nodeGroup, firstNode);
      } else {
        svgElement.appendChild(nodeGroup);
      }
    }

    toast.success('New node added');
  };

  useEffect(() => {
    if (!code) return;

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
            useMaxWidth: true
          },
          themeVariables: {
            primaryColor: colors.nodeBackground,
            primaryBorderColor: colors.nodeBorder,
            primaryTextColor: colors.text,
            lineColor: colors.lineColor,
            fontFamily: config.font || 'inter'
          },
          securityLevel: 'loose'
        });

        if (containerRef.current) {
          const wrapper = containerRef.current.querySelector('.flowchart-wrapper');
          if (wrapper) {
            wrapper.innerHTML = '';
            const id = `flowchart-${Date.now()}`;
            
            try {
              const { svg } = await mermaid.render(id, cleanCode);
              wrapper.innerHTML = svg;
              
              const svgElement = wrapper.querySelector('svg');
              if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.maxWidth = 'none';

                // Add click handlers to nodes
                const nodes = svgElement.querySelectorAll('.node');
                nodes.forEach(node => {
                  node.style.cursor = 'pointer';
                  node.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const shape = node.querySelector('rect, circle, polygon');
                    if (shape) {
                      setSelectedNode({
                        id: node.id,
                        text: node.querySelector('text')?.textContent || '',
                        shape: shape.tagName.toLowerCase()
                      });
                      setShowNodeEditor(true);
                    }
                  });
                });
              }
            } catch (renderError) {
              console.error('Mermaid render error:', renderError);
              wrapper.innerHTML = `<div class="text-red-500">Error rendering flowchart</div>`;
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize mermaid:', error);
        toast.error('Failed to render flowchart');
      }
    };

    initializeMermaid();
  }, [code, config]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.toolbar') || e.target.closest('.node-editor')) return;
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
      requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y
        });
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta) => {
    setScale(prev => Math.min(Math.max(0.3, prev + delta), 3));
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
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        handleZoom(delta);
      }
    };
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [isPanning, position, startPan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 space-y-4"
    >
      <Toolbar
        onZoom={handleZoom}
        onReset={resetView}
        onExport={handleExport}
        onBack={onBack}
        onAddNode={addNewNode}
        scale={scale}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onExplain={generateSummary}
        showSummary={showSummary}
        summaryLoading={summaryLoading}
      />

      <div className="flex gap-4">
        <motion.div 
          ref={containerRef}
          className="relative overflow-hidden bg-white rounded-lg border shadow-sm flex-grow"
          style={{ height: 'calc(100vh - 12rem)', cursor: isPanning ? 'grabbing' : 'grab' }}
          layout
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
            className="flowchart-wrapper absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
          />

          <AnimatePresence>
            {showNodeEditor && selectedNode && (
              <NodeEditor 
                node={selectedNode}
                onClose={() => setShowNodeEditor(false)}
                onUpdate={updateNode}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-96"
            >
              <SideSummary 
                summary={summary}
                keyPoints={keyPoints}
                onClose={() => setShowSummary(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .flowchart-wrapper svg {
          max-width: none !important;
          height: auto;
        }

        .node rect,
        .node circle,
        .node polygon {
          fill: ${themeColors[config.theme]?.nodeBackground || themeColors.default.nodeBackground};
          stroke: ${themeColors[config.theme]?.nodeBorder || themeColors.default.nodeBorder};
          stroke-width: 2px;
          transition: all 0.2s ease-in-out;
        }

        .node:hover rect,
        .node:hover circle,
        .node:hover polygon {
          filter: brightness(0.95);
        }

        .node text {
          fill: ${themeColors[config.theme]?.text || themeColors.default.text};
          transition: fill 0.2s ease-in-out;
        }

        .edgePath path {
          stroke: ${themeColors[config.theme]?.lineColor || themeColors.default.lineColor};
          stroke-width: 2px;
          transition: stroke 0.2s ease-in-out;
        }

        marker path {
          fill: ${themeColors[config.theme]?.lineColor || themeColors.default.lineColor};
        }

        .edgeLabel {
          background-color: white;
          padding: 4px;
        }

        .flowchart-wrapper:focus {
          outline: none;
        }

        .selected rect,
        .selected circle,
        .selected polygon {
          stroke-width: 3px !important;
          filter: brightness(0.95);
        }
      `}</style>
    </motion.div>
  );
}