'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfigPanel } from './ConfigPanel';
import { MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FlowchartViewer } from './FlowchartViewer';
import mermaid from 'mermaid';

// Add AI conversation messages
const AI_MESSAGES = [
  "I can help you create any type of flowchart. What would you like to visualize?",
  "Need help organizing a process? I'm here to help!",
  "Got a complex workflow? Let's break it down together!",
  "I can turn your ideas into clear visual flows. What's on your mind?",
  "Ready to map out your process. What would you like to create?"
];

const conversationalPrompts = [
  "Create a login flow with password reset",
  "Show an e-commerce checkout process",
  "Design a user onboarding flow",
  "Map out a customer support workflow",
  "Create a simple data backup process"
];

export function Editor() {
  const [prompt, setPrompt] = useState('');
  const [flowchartCode, setFlowchartCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMessage, setAiMessage] = useState(AI_MESSAGES[0]);
  const [config, setConfig] = useState({
    type: 'process',
    theme: 'default',
    font: 'inter'
  });
  const [showFlowchart, setShowFlowchart] = useState(false);

  const generateFlowchart = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config }),
      });
      
      if (!response.ok) throw new Error('Failed to generate flowchart');
      
      const data = await response.json();
      console.log('Generated flowchart:', data); // Debug log
      
      if (data.mermaidCode) {
        setFlowchartCode(data.mermaidCode);
        setShowFlowchart(true);
        toast.success('Flowchart created successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('I had trouble creating that. Could you try explaining it differently?');
      toast.error('Failed to generate flowchart');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    if (e.target.value.length % 50 === 0) {
      setAiMessage(AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)]);
    }
  };

  // If flowchart is generated, show the viewer
  if (showFlowchart && flowchartCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FlowchartViewer 
          code={flowchartCode}
          config={config}
          onBack={() => setShowFlowchart(false)}
        />
      </div>
    );
  }

  // Show the input form
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ConfigPanel config={config} setConfig={setConfig} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-blue-500" />
              <h2 className="text-xl font-medium">Let's create your flowchart</h2>
            </div>
            
            <div className="mb-4 text-gray-600">
              {aiMessage}
            </div>

            <div className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hey! I can help you create any kind of flowchart. Just describe what you need..."
                value={prompt}
                onChange={handlePromptChange}
              />
              
              <div className="flex flex-wrap gap-2">
                {conversationalPrompts.map((example, index) => (
                  <button
                    key={index}
                    className="text-sm px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>

              <Button 
                variant="primary"
                onClick={generateFlowchart}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-white"></div>
                    Working on it...
                  </div>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Create Flowchart
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <div className="text-lg font-medium text-gray-900">Generating your flowchart...</div>
              <div className="text-sm text-gray-500">This might take a few seconds</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}