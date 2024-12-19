// src/components/flowchart/NodeQuickEdit.js
'use client';

export function NodeQuickEdit({ node, position, onUpdate, onClose }) {
  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg border p-4 w-72 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={node.text}
            onChange={(e) => onUpdate({ ...node, text: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={node.shape}
            onChange={(e) => onUpdate({ ...node, shape: e.target.value })}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rectangle">Rectangle</option>
            <option value="roundedRect">Rounded Rectangle</option>
            <option value="diamond">Diamond</option>
            <option value="circle">Circle</option>
          </select>
          
          <input
            type="color"
            value={node.color || '#000000'}
            onChange={(e) => onUpdate({ ...node, color: e.target.value })}
            className="w-12 h-10 rounded-md cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}