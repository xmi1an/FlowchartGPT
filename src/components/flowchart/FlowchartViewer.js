'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Grid, ArrowLeft, 
  Plus, Lightbulb, Code2, FileCode, Square, Circle, Diamond, 
  Hexagon, X, MessageSquare, Terminal, Image
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { themeColors } from '@/utils/theme';
import { NodeEditor } from './NodeEditor';
import { SideSummary } from './SideSummary';
import { ChatWidget } from './ChatWidget';

// Node type definitions with shapes and examples
const nodeTypes = [
  { 
    id: 'rectangle', 
    name: 'Process', 
    shape: 'rect',
    icon: Square,
    example: '[Process Step]'
  },
  { 
    id: 'circle', 
    name: 'State', 
    shape: 'circle',
    icon: Circle,
    example: '((Current State))'
  },
  { 
    id: 'diamond', 
    name: 'Decision', 
    shape: 'diamond',
    icon: Diamond,
    example: '{Decision Point?}'
  },
  { 
    id: 'hexagon', 
    name: 'Preparation', 
    shape: 'hexagon',
    icon: Hexagon,
    example: '{{Prepare Data}}'
  }
];

// Image export helper function
async function downloadImage(svgElement, format) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const data = new XMLSerializer().serializeToString(svgElement);
  const DOMURL = window.URL || window.webkitURL || window;
  
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  const url = DOMURL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width * 2;  // For better quality on retina displays
      canvas.height = img.height * 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        if (format === 'svg') {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          resolve({ url: DOMURL.createObjectURL(svgBlob), ext: 'svg' });
        } else {
          canvas.toBlob((blob) => {
            resolve({ url: DOMURL.createObjectURL(blob), ext: format });
          }, `image/${format}`, 1.0);  // 1.0 is for maximum quality
        }
      } catch (error) {
        reject(error);
      } finally {
        DOMURL.revokeObjectURL(url);
      }
    };
    img.src = url;
  });
}

// Shape helper function
function determineShape(node) {
  const shape = node.querySelector('rect, circle, polygon');
  if (!shape) return 'rectangle';
  
  const tagName = shape.tagName.toLowerCase();
  if (tagName === 'circle') return 'circle';
  if (tagName === 'polygon') {
    const points = shape.getAttribute('points')?.split(' ').length;
    return points === 4 ? 'diamond' : 'hexagon';
  }
  return 'rectangle';
}

// Node creation helper
function createNodeElement(shape, position, colors) {
  const svgNS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(svgNS, "g");
  g.classList.add("node");
  g.setAttribute("style", "cursor: pointer;");

  let shapeElement;
  switch (shape) {
    case 'circle':
      shapeElement = document.createElementNS(svgNS, "circle");
      shapeElement.setAttribute("r", "30");
      shapeElement.setAttribute("cx", position.x);
      shapeElement.setAttribute("cy", position.y);
      break;
    case 'diamond':
      shapeElement = document.createElementNS(svgNS, "polygon");
      const diamondPoints = [
        `${position.x},${position.y - 30}`,
        `${position.x + 30},${position.y}`,
        `${position.x},${position.y + 30}`,
        `${position.x - 30},${position.y}`
      ].join(" ");
      shapeElement.setAttribute("points", diamondPoints);
      break;
    case 'hexagon':
      shapeElement = document.createElementNS(svgNS, "polygon");
      const hexPoints = [
        `${position.x - 25},${position.y}`,
        `${position.x - 12.5},${position.y - 25}`,
        `${position.x + 12.5},${position.y - 25}`,
        `${position.x + 25},${position.y}`,
        `${position.x + 12.5},${position.y + 25}`,
        `${position.x - 12.5},${position.y + 25}`
      ].join(" ");
      shapeElement.setAttribute("points", hexPoints);
      break;
    default: // rectangle
      shapeElement = document.createElementNS(svgNS, "rect");
      shapeElement.setAttribute("width", "60");
      shapeElement.setAttribute("height", "40");
      shapeElement.setAttribute("x", position.x - 30);
      shapeElement.setAttribute("y", position.y - 20);
      shapeElement.setAttribute("rx", "5");
      break;
  }

  shapeElement.setAttribute("fill", colors.nodeBackground);
  shapeElement.setAttribute("stroke", colors.nodeBorder);
  shapeElement.setAttribute("stroke-width", "2");
  
  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("x", position.x);
  text.setAttribute("y", position.y + 5);
  text.setAttribute("fill", colors.text);
  text.setAttribute("font-family", "system-ui");
  text.setAttribute("font-size", "14px");
  text.textContent = "New Node";

  g.appendChild(shapeElement);
  g.appendChild(text);
  
  return g;
}
// NodePicker Component
function NodePicker({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border p-4 z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Add Node</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {nodeTypes.map(type => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <type.icon className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-700">{type.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Export Menu Component
function ExportMenu({ onExport, onClose }) {
  const exportOptions = [
    { id: 'svg', label: 'SVG Vector', icon: FileCode },
    { id: 'png', label: 'PNG Image', icon: Image },
    { id: 'jpg', label: 'JPG Image', icon: Image }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[160px]"
    >
      {exportOptions.map(option => (
        <button
          key={option.id}
          onClick={() => {
            onExport(option.id);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <option.icon size={16} />
          {option.label}
        </button>
      ))}
    </motion.div>
  );
}

// Toolbar Component
function Toolbar({
  onZoom,
  onReset,
  onExport,
  onBack,
  onAddNode,
  scale,
  showGrid,
  onToggleGrid,
  onExplain,
  onViewMermaid,
  onViewPseudocode,
  showSummary,
  showMermaidSyntax,
  showPseudocode,
  summaryLoading,
  syntaxLoading,
  pseudocodeLoading,
  onToggleChat
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        <button
          onClick={() => onZoom(-0.1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>

        <button
          onClick={() => onZoom(0.1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>

        <span className="text-sm text-gray-500 min-w-[60px]">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Reset View"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewMermaid}
          disabled={syntaxLoading}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
            showMermaidSyntax
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="View Mermaid Syntax"
        >
          <Code2 size={20} />
          <span>Mermaid</span>
        </button>

        <button
          onClick={onViewPseudocode}
          disabled={pseudocodeLoading}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
            showPseudocode
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="View Pseudocode"
        >
          <Terminal size={20} />
          <span>Pseudocode</span>
        </button>

        <button
          onClick={onExplain}
          disabled={summaryLoading}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
            showSummary
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Explain Flowchart"
        >
          <Lightbulb size={20} />
          <span>Summary</span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        <button
          onClick={onAddNode}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-600"
          title="Add Node"
        >
          <Plus size={20} />
          <span>Add Node</span>
        </button>

        <button
          onClick={onToggleChat}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-600"
          title="Ideas & Suggestions"
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <Download size={20} />
            <span>Export</span>
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <ExportMenu 
                onExport={onExport}
                onClose={() => setShowExportMenu(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export function FlowchartViewer({ code, config, onBack, onChange }) {
  // State declarations
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showMermaidSyntax, setShowMermaidSyntax] = useState(false);
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [mermaidSyntax, setMermaidSyntax] = useState('');
  const [pseudocode, setPseudocode] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [syntaxLoading, setSyntaxLoading] = useState(false);
  const [pseudocodeLoading, setPseudocodeLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // API interaction functions
  const generateSummary = async () => {
    if (!code) return;
    setSummaryLoading(true);
    
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: code,
          type: 'summary',
          currentFlowchart: code
        })
      });

      if (!response.ok) throw new Error('Failed to generate explanation');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary);
      setKeyPoints(data.keyPoints);
      setShowSummary(true);
      setShowMermaidSyntax(false);
      setShowPseudocode(false);
    } catch (error) {
      console.error('Summary error:', error);
      toast.error('Failed to generate explanation');
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateMermaidSyntax = async () => {
    if (!code) return;
    setSyntaxLoading(true);
    
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: code,
          type: 'mermaid',
          currentFlowchart: code
        })
      });

      if (!response.ok) throw new Error('Failed to get Mermaid syntax');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setMermaidSyntax(data.mermaidCode);
      setShowMermaidSyntax(true);
      setShowSummary(false);
      setShowPseudocode(false);
    } catch (error) {
      console.error('Syntax error:', error);
      toast.error('Failed to get Mermaid syntax');
    } finally {
      setSyntaxLoading(false);
    }
  };

  const generatePseudocode = async () => {
    if (!code) return;
    setPseudocodeLoading(true);
    
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: code,
          type: 'pseudocode',
          currentFlowchart: code
        })
      });

      if (!response.ok) throw new Error('Failed to generate pseudocode');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setPseudocode(data.pseudocode);
      setShowPseudocode(true);
      setShowSummary(false);
      setShowMermaidSyntax(false);
    } catch (error) {
      console.error('Pseudocode error:', error);
      toast.error('Failed to generate pseudocode');
    } finally {
      setPseudocodeLoading(false);
    }
  };

  // Handle export with different formats
  const handleExport = async (format = 'svg') => {
    try {
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        toast.error('No flowchart to export');
        return;
      }

      const { url, ext } = await downloadImage(svgElement, format);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flowchart.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Flowchart exported as ${ext.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  // Node operations
  const handleNodeAdd = (type) => {
    const wrapper = containerRef.current?.querySelector('.flowchart-wrapper');
    if (!wrapper) return;

    const svgElement = wrapper.querySelector('svg');
    if (!svgElement) return;

    const bounds = svgElement.getBoundingClientRect();
    const centerX = (bounds.width / 2 - position.x) / scale;
    const centerY = (bounds.height / 2 - position.y) / scale;

    const colors = themeColors[config.theme] || themeColors.default;
    const node = createNodeElement(type.shape, { x: centerX, y: centerY }, colors);

    node.id = `node-${Date.now()}`;
    svgElement.appendChild(node);
    setShowNodePicker(false);
    setLastUpdate(Date.now());
    toast.success('Node added successfully');
  };
  // Mouse event handlers
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

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      const newScale = Math.min(Math.max(0.3, scale + delta), 3);
      setScale(newScale);
    }
  };

  // Event listeners
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, position, startPan, scale]);

  // Initialize mermaid
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
            curve: 'natural',
            padding: 20,
            useMaxWidth: true,
            htmlLabels: true,
            defaultRenderer: 'dagre-d3'
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

        await renderFlowchart(cleanCode, colors);
      } catch (error) {
        console.error('Failed to initialize mermaid:', error);
        toast.error('Failed to render flowchart');
      }
    };

    initializeMermaid();
  }, [code, config, lastUpdate]);

  const renderFlowchart = async (cleanCode, colors) => {
    if (!containerRef.current) return;

    const wrapper = containerRef.current.querySelector('.flowchart-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';
    const id = `flowchart-${Date.now()}`;
    
    try {
      const { svg } = await mermaid.render(id, cleanCode);
      wrapper.innerHTML = svg;

      const svgElement = wrapper.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        
        // Make nodes interactive
        const nodes = svgElement.querySelectorAll('.node');
        nodes.forEach(node => {
          node.style.cursor = 'pointer';
          node.addEventListener('click', (e) => {
            if (!isPanning) {
              e.stopPropagation();
              const shape = node.querySelector('rect, circle, polygon');
              setSelectedNode({
                id: node.id,
                text: node.querySelector('text')?.textContent || '',
                shape: shape ? determineShape(node) : 'rectangle',
                fontSize: parseInt(node.querySelector('text')?.style.fontSize || '14')
              });
            }
          });

          // Apply theme colors and styles
          const shape = node.querySelector('rect, circle, polygon');
          const text = node.querySelector('text');
          if (shape) {
            shape.style.fill = colors.nodeBackground;
            shape.style.stroke = colors.nodeBorder;
            shape.style.strokeWidth = '2';
            shape.style.transition = 'all 0.2s ease-in-out';
          }
          if (text) {
            text.style.fill = colors.text;
            text.style.fontWeight = '500';
            text.style.userSelect = 'none';
          }
        });

        // Style edges and connections
        const edges = svgElement.querySelectorAll('.edge path');
        edges.forEach(edge => {
          edge.style.stroke = colors.lineColor;
          edge.style.strokeWidth = '2';
          edge.style.transition = 'all 0.2s ease-in-out';
        });

        const markers = svgElement.querySelectorAll('marker path');
        markers.forEach(marker => {
          marker.style.fill = colors.lineColor;
          marker.style.stroke = colors.lineColor;
        });

        const edgeLabels = svgElement.querySelectorAll('.edgeLabel');
        edgeLabels.forEach(label => {
          const rect = label.querySelector('rect');
          const text = label.querySelector('text');
          if (rect) {
            rect.style.fill = '#ffffff';
            rect.style.stroke = colors.lineColor;
            rect.style.strokeWidth = '1';
          }
          if (text) {
            text.style.fill = colors.text;
          }
        });
      }
    } catch (error) {
      console.error('Mermaid render error:', error);
      wrapper.innerHTML = `<div class="text-red-500">Error rendering flowchart</div>`;
      toast.error('Failed to render flowchart');
    }
  };
  // Component render
  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 space-y-4"
      >
        <Toolbar
          onZoom={(delta) => setScale(prev => Math.min(Math.max(0.3, prev + delta), 3))}
          onReset={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          onExport={handleExport}
          onBack={onBack}
          onAddNode={() => setShowNodePicker(true)}
          scale={scale}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onExplain={generateSummary}
          onViewMermaid={generateMermaidSyntax}
          onViewPseudocode={generatePseudocode}
          showSummary={showSummary}
          showMermaidSyntax={showMermaidSyntax}
          showPseudocode={showPseudocode}
          summaryLoading={summaryLoading}
          syntaxLoading={syntaxLoading}
          pseudocodeLoading={pseudocodeLoading}
          onToggleChat={() => setShowChat(!showChat)}
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
              {showNodePicker && (
                <NodePicker
                  onSelect={handleNodeAdd}
                  onClose={() => setShowNodePicker(false)}
                />
              )}

              {selectedNode && (
                <NodeEditor
                  node={selectedNode}
                  onUpdate={(updatedNode) => {
                    const nodeElement = containerRef.current?.querySelector(`#${selectedNode.id}`);
                    if (nodeElement) {
                      const textElement = nodeElement.querySelector('text');
                      if (textElement) {
                        textElement.textContent = updatedNode.text;
                        textElement.style.fontSize = `${updatedNode.fontSize}px`;
                      }
                    }
                    setSelectedNode(null);
                    setLastUpdate(Date.now());
                  }}
                  onClose={() => setSelectedNode(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {(showSummary || showMermaidSyntax || showPseudocode) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96"
              >
                {showSummary && (
                  <SideSummary 
                    summary={summary}
                    keyPoints={keyPoints}
                    onClose={() => setShowSummary(false)}
                  />
                )}
                {showMermaidSyntax && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="text-blue-600" size={24} />
                        <h3 className="text-lg font-semibold">Mermaid Syntax</h3>
                      </div>
                      <button 
                        onClick={() => setShowMermaidSyntax(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono">
                      {mermaidSyntax}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mermaidSyntax);
                        toast.success('Copied to clipboard!');
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                )}
                {showPseudocode && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="text-blue-600" size={24} />
                        <h3 className="text-lg font-semibold">Pseudocode</h3>
                      </div>
                      <button 
                        onClick={() => setShowPseudocode(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono whitespace-pre-wrap">
                      {pseudocode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pseudocode);
                        toast.success('Copied to clipboard!');
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global styles */}
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
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .node text {
            fill: ${themeColors[config.theme]?.text || themeColors.default.text};
            font-weight: 500;
            transition: all 0.2s ease-in-out;
            user-select: none;
          }

          .edgePath path {
            stroke: ${themeColors[config.theme]?.lineColor || themeColors.default.lineColor};
            stroke-width: 2px;
            transition: all 0.2s ease-in-out;
          }

          marker path {
            fill: ${themeColors[config.theme]?.lineColor || themeColors.default.lineColor};
          }

          .edgeLabel {
            background-color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
        `}</style>
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
      {showChat && (
          <ChatWidget 
            code={code}
            onClose={() => setShowChat(false)}
            onUpdateFlowchart={(changes) => {
              if (changes?.mermaidCode) {
                onChange?.(changes.mermaidCode);
                setLastUpdate(Date.now());
                toast.success('Flowchart updated successfully!');
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}