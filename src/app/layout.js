// src/app/layout.js
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'FlowchartGPT',
  description: 'AI-powered flowchart creation tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <Toaster position="top-right" />
        <main>{children}</main>
      </body>
    </html>
  );
}