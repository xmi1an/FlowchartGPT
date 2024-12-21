// src/components/flowchart/ChatWidget.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Minimize2 } from 'lucide-react';

function Message({ text, isBot, animationDelay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isBot 
          ? 'bg-white border shadow-sm' 
          : 'bg-blue-600 text-white'
      }`}>
        <p className="text-sm">{text}</p>
      </div>
    </motion.div>
  );
}

export function ChatWidget({ code, onUpdateFlowchart, onClose }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I can help you modify your flowchart. What changes would you like to make?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !code) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          type: 'modification',
          currentFlowchart: code
        })
      });

      if (!response.ok) throw new Error('Failed to modify flowchart');
      
      const data = await response.json();
      setIsTyping(false);

      if (data.mermaidCode) {
        onUpdateFlowchart({ mermaidCode: data.mermaidCode });
        setMessages(prev => [...prev, { 
          text: data.response || "I've applied the changes you requested!", 
          isBot: true 
        }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Sorry, I couldn't process that request. Please try again.", 
        isBot: true 
      }]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      className="fixed top-24 right-6 w-96 h-[540px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} />
          <h3 className="font-medium">Chat with AI</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.text}
            isBot={message.isBot}
            animationDelay={index * 0.1}
          />
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <Bot size={18} className="text-blue-500 animate-pulse" />
            </div>
            <span>Thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the changes you want..."
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}