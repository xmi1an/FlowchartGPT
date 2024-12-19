// src/components/flowchart/ConfigPanel.js
'use client';

export function ConfigPanel({ config, setConfig }) {
  const flowchartTypes = [
    { id: 'process', name: 'Process Flow', description: 'Standard top-to-bottom process flow' },
    { id: 'userJourney', name: 'User Journey', description: 'Map out user interactions and experiences' },
    { id: 'systemFlow', name: 'System Architecture', description: 'Technical system interactions' },
    { id: 'decision', name: 'Decision Tree', description: 'Complex decision-making paths' },
    { id: 'dataFlow', name: 'Data Flow', description: 'How data moves through a system' },
    { id: 'stateDiagram', name: 'State Diagram', description: 'System states and transitions' },
    { id: 'sequence', name: 'Sequence Flow', description: 'Step-by-step sequence of events' },
    { id: 'swimlane', name: 'Swimlane Process', description: 'Processes across departments/roles' },
    { id: 'mindMap', name: 'Mind Map', description: 'Hierarchical thought organization' },
    { id: 'timeline', name: 'Timeline Flow', description: 'Time-based process flow' }
  ];

  const colorThemes = [
    { id: 'default', colors: ['#000000', '#FFFFFF'], name: 'Classic' },
    { id: 'ocean', colors: ['#1e3a8a', '#bfdbfe'], name: 'Ocean' },
    { id: 'forest', colors: ['#064e3b', '#bbf7d0'], name: 'Forest' },
    { id: 'sunset', colors: ['#7c2d12', '#fed7aa'], name: 'Sunset' },
    { id: 'ruby', colors: ['#9f1239', '#ffe4e6'], name: 'Ruby' },
    { id: 'emerald', colors: ['#059669', '#d1fae5'], name: 'Emerald' },
    { id: 'amber', colors: ['#d97706', '#fef3c7'], name: 'Amber' },
    { id: 'slate', colors: ['#1e293b', '#f1f5f9'], name: 'Slate' },
    { id: 'rose', colors: ['#be123c', '#ffe4e6'], name: 'Rose' },
    { id: 'teal', colors: ['#0d9488', '#ccfbf1'], name: 'Teal' },
    { id: 'indigo', colors: ['#3730a3', '#e0e7ff'], name: 'Indigo' },
    { id: 'coral', colors: ['#c92a2a', '#ffe4e0'], name: 'Coral' },
    { id: 'mint', colors: ['#047857', '#ecfdf5'], name: 'Mint' },
    { id: 'azure', colors: ['#075985', '#e0f2fe'], name: 'Azure' },
    { id: 'royal', colors: ['#4c1d95', '#e8e0ff'], name: 'Royal' }
  ];

  const fonts = [
    { id: 'inter', name: 'Inter' },
    { id: 'roboto', name: 'Roboto' },
    { id: 'poppins', name: 'Poppins' },
    { id: 'montserrat', name: 'Montserrat' },
    { id: 'openSans', name: 'Open Sans' }
  ];

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium mb-2">Flowchart Type</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={config.type}
          onChange={(e) => setConfig({ ...config, type: e.target.value })}
        >
          {flowchartTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {flowchartTypes.find(t => t.id === config.type)?.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color Theme</label>
        <div className="grid grid-cols-5 gap-2">
          {colorThemes.map(theme => (
            <button
              key={theme.id}
              className={`group relative w-full aspect-square rounded-md border-2 transition-all duration-200 ${
                config.theme === theme.id 
                  ? 'border-black scale-105' 
                  : 'border-transparent hover:scale-105'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
              }}
              onClick={() => setConfig({ ...config, theme: theme.id })}
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white text-xs rounded-md">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {colorThemes.find(t => t.id === config.theme)?.name}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font Style</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={config.font}
          onChange={(e) => setConfig({ ...config, font: e.target.value })}
        >
          {fonts.map(font => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}