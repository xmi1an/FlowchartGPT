'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Message({ text, isBot, animationDelay = 0 }) {
  // Format the text if it's from the bot
  const formatBotMessage = (message) => {
    if (!message.includes('###')) return message;

    // Split the message into sections
    const sections = message.split('###').filter(Boolean);
    
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const [title, ...content] = section.trim().split('\n');
          return (
            <div key={index} className="space-y-2">
              <h4 className="font-medium text-blue-900">{title}</h4>
              <div className="space-y-2 pl-4">
                {content.map((line, i) => {
                  // Convert ** text ** to bold
                  const formattedLine = line.split('**').map((part, j) => 
                    j % 2 === 1 ? <strong key={j} className="text-blue-700">{part}</strong> : part
                  );
                  
                  return (
                    <p key={i} className="text-gray-700">
                      {formattedLine}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div 
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isBot 
            ? 'bg-white border shadow-sm' 
            : 'bg-blue-600 text-white'
        }`}
      >
        {isBot ? formatBotMessage(text) : (
          <p className="text-sm leading-relaxed">{text}</p>
        )}
      </div>
    </motion.div>
  );
}

export function ChatWidget({ code, onClose }) {
  const [messages, setMessages] = useState([
    { 
      text: "Hi! I can help analyze your flowchart and suggest improvements. Would you like me to start with a specific section or review the entire flow?", 
      isBot: true 
    }
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
    inputRef.current?.focus();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !code || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${userMessage}\n\nBe specific and format your response with clear sections.`,
          type: 'chat',
          currentFlowchart: code
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setMessages(prev => [...prev, { 
        text: data.response || "Here's what I think about that...", 
        isBot: true 
      }]);

      // Offer follow-up suggestions
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "### Next Steps\nWould you like me to:\n1. **Analyze another section** of the flowchart?\n2. **Suggest specific improvements** for a particular part?\n3. **Review best practices** for this type of diagram?", 
          isBot: true 
        }]);
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get a response. Please try again.');
      setMessages(prev => [...prev, { 
        text: "### Error\nI apologize, but I couldn't process that request. Could you try rephrasing or asking something else?", 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed bottom-6 right-6 w-96 h-[540px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} />
          <h3 className="font-medium">Flowchart Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
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
            placeholder="Ask for suggestions or analysis..."
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isTyping}
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