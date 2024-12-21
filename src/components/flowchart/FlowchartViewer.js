'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Grid, ArrowLeft, 
  Plus, Lightbulb, Code2, FileCode, Square, Circle, Diamond, 
  Hexagon, X, MessageSquare, Terminal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { themeColors } from '@/utils/theme';
import { NodeEditor } from './NodeEditor';
import { SideSummary } from './SideSummary';
import { ChatWidget } from './ChatWidget';
import { Toolbar } from './Toolbar';

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
  // Generate summary, syntax, and pseudocode
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

  const generateMermaidSyntax = async () => {
    if (!code) return;
    setSyntaxLoading(true);
    
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: code,
          type: 'mermaid'
        })
      });

      if (!response.ok) throw new Error('Failed to get Mermaid syntax');
      const data = await response.json();
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
          type: 'pseudocode'
        })
      });

      if (!response.ok) throw new Error('Failed to generate pseudocode');
      const data = await response.json();
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
      setScale(prev => Math.min(Math.max(0.3, prev + delta), 3));
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
  }, [isPanning, position, startPan]);
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
            curve: 'basis',
            padding: 20,
            useMaxWidth: true,
            htmlLabels: true,
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
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}