'use client';

import { useEffect, useState } from 'react';
import { Square, Circle, Diamond, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NodeEditor({ node, onUpdate, onClose }) {
  const [editedNode, setEditedNode] = useState(node);

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  const shapes = [
    { 
      id: 'rectangle', 
      name: 'Rectangle', 
      syntax: '[]',
      icon: Square,
      preview: 'w-12 h-8 rounded-none'
    },
    { 
      id: 'roundedRect', 
      name: 'Rounded Rectangle', 
      syntax: '()',
      icon: Square,
      preview: 'w-12 h-8 rounded-lg'
    },
    { 
      id: 'diamond', 
      name: 'Decision', 
      syntax: '{}',
      icon: Diamond,
      preview: 'w-10 h-10 rotate-45'
    },
    { 
      id: 'circle', 
      name: 'Circle', 
      syntax: '(())',
      icon: Circle,
      preview: 'w-10 h-10 rounded-full'
    },
    { 
      id: 'parallelogram', 
      name: 'Input/Output', 
      syntax: '[/]',
      icon: Square,
      preview: 'w-12 h-8 skew-x-12'
    },
    { 
      id: 'hexagon', 
      name: 'Process', 
      syntax: '{{}}',
      icon: Hexagon,
      preview: 'w-12 h-8 clip-path-hexagon'
    }
  ];

  const predefinedColors = [
    { name: 'White', value: '#FFFFFF', textColor: '#000000' },
    { name: 'Light Blue', value: '#DBEAFE', textColor: '#1E40AF' },
    { name: 'Light Green', value: '#DCFCE7', textColor: '#166534' },
    { name: 'Light Yellow', value: '#FEF3C7', textColor: '#92400E' },
    { name: 'Light Red', value: '#FEE2E2', textColor: '#991B1B' },
    { name: 'Light Purple', value: '#F3E8FF', textColor: '#6B21A8' }
  ];

  const handleUpdate = (changes) => {
    const updated = { ...editedNode, ...changes };
    setEditedNode(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl p-6 w-[480px] max-w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Edit Node</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Node Text</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
              value={editedNode.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter node text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Shape</label>
            <div className="grid grid-cols-3 gap-3">
              {shapes.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => handleUpdate({ shape: shape.id })}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    editedNode.shape === shape.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className={`${shape.preview} bg-current`} />
                  <span className="text-xs font-medium">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Color</label>
            <div className="grid grid-cols-3 gap-3">
              {predefinedColors.map(color => (
                <button
                  key={color.value}
                  onClick={() => handleUpdate({ 
                    backgroundColor: color.value,
                    textColor: color.textColor
                  })}
                  className={`h-12 rounded-lg transition-all ${
                    editedNode.backgroundColor === color.value
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Font Size: {editedNode.fontSize || 14}px
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                className="flex-1 accent-blue-600"
                value={editedNode.fontSize || 14}
                onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
              />
              <span className="text-sm text-gray-500 w-12 text-right">
                {editedNode.fontSize || 14}px
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate(editedNode);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}