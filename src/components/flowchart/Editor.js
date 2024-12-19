// src/components/flowchart/Editor.js
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FlowchartViewer } from './FlowchartViewer';
import { ConfigPanel } from './ConfigPanel';
import { NodeEditor } from './NodeEditor';
import { updateNodeInMermaid } from '@/utils/mermaidUtils';
import { 
  Download, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Lightbulb, 
  List, 
  AlertCircle,
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const conversationalPrompts = [
  "Hey! I need a flowchart for user registration process",
  "Can you create a diagram showing how our support tickets are handled?",
  "I want to visualize our product approval workflow",
  "Help me map out our customer onboarding journey"
];

const aiResponses = [
  "I'd love to help! Tell me more about what you're looking to create...",
  "Sure thing! Just describe your process and I'll turn it into a flowchart...",
  "I can help with that! What specific steps should we include?",
  "Of course! Just explain the process naturally and I'll organize it..."
];

function SideSummary({ summary, keyPoints, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white shadow-lg p-6 space-y-4 h-full">
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={24} />
          <h3 className="text-lg font-semibold">Process Explanation</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 overflow-auto">
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
export function FlowchartEditor() {
  const [prompt, setPrompt] = useState('');
  const [flowchart, setFlowchart] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMessage, setAiMessage] = useState(aiResponses[0]);
  const [config, setConfig] = useState({
    type: 'process',
    theme: 'default',
    font: 'inter'
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleNodeUpdate = async (updatedNode) => {
    try {
      const newMermaidCode = updateNodeInMermaid(flowchart, updatedNode.id, updatedNode);
      setFlowchart(newMermaidCode);
      await new Promise(resolve => setTimeout(resolve, 100));
      toast.success('Changes applied successfully!');
      setSelectedNode(null);
    } catch (err) {
      toast.error('Failed to update node');
      console.error('Error updating node:', err);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: flowchart,
          type: 'summary',
          config
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
        setKeyPoints(data.keyPoints || []);
        setShowSummary(true);
        toast.success('Summary generated!');
      } else {
        throw new Error('No summary received');
      }
    } catch (err) {
      toast.error('Failed to generate summary');
      console.error('Summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('flowchart-container');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: 'flowchart.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    try {
      toast.promise(
        html2pdf().set(opt).from(element).save(),
        {
          loading: 'Creating PDF...',
          success: 'PDF downloaded!',
          error: 'Failed to create PDF'
        }
      );
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const generateFlowchart = async () => {
    if (!prompt.trim()) return;

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
      setFlowchart(data.mermaidCode);
      setAiMessage("Here's what I created! Click any element to edit it, or ask me to explain the flowchart.");
      setShowSummary(false);
    } catch (err) {
      setError('I had trouble creating that. Could you try explaining it differently?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ConfigPanel config={config} setConfig={setConfig} />
        </div>

        <div className="lg:col-span-3 space-y-6">
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
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (e.target.value.length % 50 === 0) {
                    setAiMessage(aiResponses[Math.floor(Math.random() * aiResponses.length)]);
                  }
                }}
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

              <div className="flex gap-3 flex-wrap">
                <Button 
                  variant="primary"
                  onClick={generateFlowchart}
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Working on it...' : (
                    <>
                      <Sparkles size={18} />
                      Create Flowchart
                    </>
                  )}
                </Button>

                {flowchart && (
                  <>
                    <Button
                      variant="outline"
                      onClick={generateSummary}
                      disabled={summaryLoading}
                      className="flex items-center gap-2"
                    >
                      <Lightbulb size={18} />
                      {summaryLoading ? 'Analyzing...' : 'Explain This'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={exportToPDF}
                      className="flex items-center gap-2"
                    >
                      <Download size={18} />
                      Save as PDF
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div 
            id="flowchart-container"
            className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]"
          >
            {flowchart ? (
              <FlowchartViewer 
                code={flowchart} 
                config={config}
                onNodeSelect={setSelectedNode}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-lg">
                  I'll show your flowchart here once you describe what you need
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {summaryLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg">Analyzing flowchart...</p>
          </div>
        </div>
      )}

      {showSummary && summary && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform z-50 overflow-auto">
          <SideSummary 
            summary={summary}
            keyPoints={keyPoints}
            onClose={() => setShowSummary(false)}
          />
        </div>
      )}

      {selectedNode && (
        <NodeEditor
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}