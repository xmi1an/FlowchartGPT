// src/components/flowchart/NodeEditor.js
'use client';

import { useEffect, useState } from 'react';

export function NodeEditor({ node, onUpdate, onClose }) {
  const [editedNode, setEditedNode] = useState(node);

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', syntax: '[]' },
    { id: 'roundedRect', name: 'Rounded Rectangle', syntax: '()' },
    { id: 'diamond', name: 'Decision Diamond', syntax: '{}' },
    { id: 'circle', name: 'Circle', syntax: '(())' },
    { id: 'parallelogram', name: 'Parallelogram', syntax: '[/]' },
    { id: 'hexagon', name: 'Hexagon', syntax: '{{}}' }
  ];

  const handleUpdate = (changes) => {
    const updated = { ...editedNode, ...changes };
    setEditedNode(updated);
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Node</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editedNode.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Shape</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editedNode.shape || 'rectangle'}
              onChange={(e) => handleUpdate({ shape: e.target.value })}
            >
              {shapes.map(shape => (
                <option key={shape.id} value={shape.id}>
                  {shape.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-full h-10 rounded-lg cursor-pointer"
                value={editedNode.color || '#000000'}
                onChange={(e) => handleUpdate({ color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Font Size: {editedNode.fontSize || 14}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              className="w-full"
              value={editedNode.fontSize || 14}
              onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate(editedNode);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}