// src/components/flowchart/FlowchartPlayground.js
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export function FlowchartPlayground({ initialFlowchart, config }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !initialFlowchart) return;

    const renderFlowchart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'base',
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 50,
          },
        });

        const { svg } = await mermaid.render('flowchart', initialFlowchart);
        containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Failed to render flowchart:', error);
      }
    };

    renderFlowchart();
  }, [initialFlowchart]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div ref={containerRef} className="w-full min-h-[500px]" />
        </div>
      </div>
    </div>
  );
}