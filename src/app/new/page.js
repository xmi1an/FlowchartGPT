'use client';

import { Editor } from '@/components/flowchart/Editor';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const flowchartFacts = [
  "Flowcharts are one of the oldest and most widely used tools for visualizing processes.",
  "Flowcharts help in breaking down complex processes into simple, easy-to-understand steps.",
  "The first documented use of flowcharts was in the 1920s by industrial engineers.",
  "Flowcharts are used in software development to map out algorithms and program flow.",
  "A well-designed flowchart can save hours of troubleshooting and debugging.",
  "Flowcharts are a universal language, making them easy to share across teams and departments.",
  "Flowcharts can be used to visualize decision-making processes in business and personal life.",
  "The diamond shape in a flowchart represents a decision or condition.",
  "Flowcharts are often used in project management to track progress and identify bottlenecks.",
  "Flowcharts can help in identifying inefficiencies in workflows and optimizing them.",
];

const instructions = [
  "After the flowchart is generated, you can edit it using the edit prompt feature",
  "If some words are unclear or anything feels missing, simply type it in the edit prompt",
  "Use specific and clear language for better results",
  "You can regenerate the flowchart multiple times to get different perspectives",
  "Add detailed steps to make your flowchart more comprehensive",
  "Review and refine your prompt to get the most accurate visualization",
  "Use the chat feature to discover edge cases and potential improvements for your flowchart",
  "Enhance your flowchart by using edit prompt to change shapes, colors of text and shapes - it's a super versatile tool!"
];

export default function NewFlowchartPage() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % flowchartFacts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFlowchartGenerate = (prompt) => {
    try {
      localStorage.setItem('lastFlowchartPrompt', prompt);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-blue-50">
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Editor onFlowchartGenerate={handleFlowchartGenerate} />
      </div>

      <div className="relative z-10 container mx-auto px-4 space-y-8">
        {/* Instructions Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              How to Use FlowchartGPT Effectively
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructions.map((instruction, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors duration-200"
              >
                <span className="flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-700">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Facts Carousel */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Did You Know?
          </h2>
          <div className="relative h-20 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentFactIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-gray-600 text-lg"
              >
                {flowchartFacts[currentFactIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}