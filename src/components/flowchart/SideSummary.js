// src/components/flowchart/SideSummary.js
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, List, AlertCircle, X } from 'lucide-react';

export function SideSummary({ summary, keyPoints, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={24} />
          <h3 className="text-lg font-semibold">Process Explanation</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 overflow-auto max-h-[calc(100vh-200px)]">
          <div>
            <h4 className="flex items-center gap-2 text-gray-700 mb-3">
              <List size={18} />
              Step-by-Step Breakdown
            </h4>
            <div className="pl-6 space-y-3">
              {summary.split('\n').map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="font-medium text-gray-900 min-w-[20px]">{index + 1}.</span>
                  <p className="text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {keyPoints?.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="flex items-center gap-2 text-gray-700 mb-3">
                <AlertCircle size={18} />
                Key Insights
              </h4>
              <ul className="space-y-2 pl-6">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}