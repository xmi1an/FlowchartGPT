// src/components/flowchart/Loading.js
'use client';

export function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-lg">Generating your flowchart...</div>
        </div>
      </div>
    </div>
  );
}