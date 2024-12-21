// src/components/flowchart/SideSyntax.js
'use client';

import { Code2, X, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function SideSyntax({ syntax, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(syntax);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold">Mermaid Syntax</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? <CheckCheck size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono whitespace-pre-wrap">
          {syntax}
        </pre>
      </div>
    </div>
  );
}