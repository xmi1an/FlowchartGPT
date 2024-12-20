// src/components/flowchart/FlowchartLoading.js
'use client';

export function FlowchartLoading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="space-y-8 w-full max-w-3xl">
        {/* Skeleton for flowchart */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded-lg w-2/3 mx-auto" />
            <div className="flex justify-center gap-8">
              <div className="h-20 bg-gray-200 rounded-lg w-1/3" />
              <div className="h-20 bg-gray-200 rounded-lg w-1/3" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500">
          Generating your flowchart...
        </div>
      </div>
    </div>
  );
}