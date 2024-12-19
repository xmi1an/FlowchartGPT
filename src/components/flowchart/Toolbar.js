// src/components/flowchart/Toolbar.js
'use client';

import { 
  ZoomIn, ZoomOut, RotateCcw, Download, Copy, 
  Grid, Move, Save, Undo, Redo 
} from 'lucide-react';

export function Toolbar({ 
  onZoom, 
  onReset, 
  onDownload,
  onToggleGrid,
  showGrid,
  scale,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  const tools = [
    {
      group: 'zoom',
      items: [
        { icon: <ZoomIn size={20} />, action: () => onZoom(0.1), label: 'Zoom In' },
        { icon: <ZoomOut size={20} />, action: () => onZoom(-0.1), label: 'Zoom Out' },
        { icon: <RotateCcw size={20} />, action: onReset, label: 'Reset View' }
      ]
    },
    {
      group: 'edit',
      items: [
        { icon: <Undo size={20} />, action: onUndo, label: 'Undo', disabled: !canUndo },
        { icon: <Redo size={20} />, action: onRedo, label: 'Redo', disabled: !canRedo }
      ]
    },
    {
      group: 'view',
      items: [
        { 
          icon: <Grid size={20} />, 
          action: onToggleGrid, 
          label: 'Toggle Grid',
          active: showGrid 
        },
        { icon: <Move size={20} />, label: 'Drag to Move', mode: true }
      ]
    },
    {
      group: 'export',
      items: [
        { icon: <Save size={20} />, action: onDownload, label: 'Save as PDF' }
      ]
    }
  ];

  return (
    <div className="bg-white border rounded-lg shadow-sm p-1 flex gap-2">
      {tools.map((group, groupIndex) => (
        <div key={group.group} className="flex items-center">
          {groupIndex > 0 && <div className="w-px h-8 bg-gray-200 mx-2" />}
          <div className="flex gap-1">
            {group.items.map((tool) => (
              <button
                key={tool.label}
                onClick={tool.action}
                disabled={tool.disabled}
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors relative group
                  ${tool.active ? 'bg-gray-100' : ''}
                  ${tool.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {tool.icon}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="ml-auto flex items-center gap-2 pr-2">
        <span className="text-sm text-gray-500">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}