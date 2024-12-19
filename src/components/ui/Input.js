// src/components/ui/Input.js
'use client';

export function Input({ error, className = '', ...props }) {
  return (
    <div>
      <input 
        className={`w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}