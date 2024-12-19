// src/components/ui/Button.js
'use client';

export function Button({ variant = 'primary', children, className = '', ...props }) {
  const variants = {
    primary: 'px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200',
    secondary: 'px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200',
    outline: 'px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200'
  };

  const baseStyle = variants[variant] || variants.primary;

  return (
    <button 
      className={`${baseStyle} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
}