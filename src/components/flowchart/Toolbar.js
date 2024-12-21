// src/components/flowchart/Toolbar.js
'use client';

import { motion } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Grid, ArrowLeft, 
  Plus, Lightbulb, MessageSquare, Terminal, Code2
} from 'lucide-react';

export function Toolbar({ 
  onZoom, 
  onReset, 
  onExport, 
  onToggleGrid,
  onBack,
  scale,
  showGrid,
  onAddNode,
  onExplain,
  onViewMermaid,
  onViewPseudocode,
  showSummary,
  summaryLoading,
  onToggleChat
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg shadow-sm p-1.5 flex items-center gap-2"
    >
      {/* Left side buttons */}
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
        <span className="px-3 text-sm text-gray-500 min-w-[60px] text-center font-medium">
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
      </div>

      {/* Right side buttons */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onExplain}
          disabled={summaryLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            summaryLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
          title="Explain Flowchart"
        >
          <Lightbulb size={18} />
          <span className="text-sm">Explain</span>
        </button>

        <button
          onClick={onViewMermaid}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="View Mermaid Syntax"
        >
          <Code2 size={18} />
          <span className="text-sm">Mermaid</span>
        </button>

        <button
          onClick={onViewPseudocode}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="View Pseudocode"
        >
          <Terminal size={18} />
          <span className="text-sm">Pseudocode</span>
        </button>

        <div className="w-px h-8 bg-gray-200" />

        <button
          onClick={onToggleChat}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">Chat with AI</span>
        </button>
      </div>
    </motion.div>
  );
}