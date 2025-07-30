'use client';

import React, { useState } from 'react';
import { Bot, Send, Loader2, BookOpen, Briefcase, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  userId?: string;
}

export default function AIAssistant({ userId }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI study assistant. I can help you with study plans, assignment guidance, career advice, and answer your questions. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'study-plan' | 'assignment' | 'career'>('chat');

  const sendMessage = async (content: string, endpoint?: string, data?: Record<string, unknown>) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(endpoint || '/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || { question: content }),
      });

      const result = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.text || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    setInput('');

    if (activeMode === 'chat') {
      sendMessage(trimmedInput);
    } else {
      handleSpecializedQuery(trimmedInput);
    }
  };

  const handleSpecializedQuery = (query: string) => {
    switch (activeMode) {
      case 'study-plan':
        // For demo purposes, using mock data. In real app, you'd collect this from user
        sendMessage(
          `Generate study plan: ${query}`,
          '/api/ai/study-plan',
          {
            subjects: query.split(',').map(s => s.trim()),
            availableHours: 6,
            difficulty: 'medium'
          }
        );
        break;
      case 'assignment':
        sendMessage(
          `Assignment help: ${query}`,
          '/api/ai/assignment-help',
          {
            subject: 'Computer Science',
            topic: 'General',
            question: query,
            difficulty: 'medium'
          }
        );
        break;
      case 'career':
        sendMessage(
          `Career advice: ${query}`,
          '/api/ai/career-advice',
          {
            interests: query.split(',').map(s => s.trim()),
            skills: ['Programming', 'Problem Solving'],
            currentYear: 3
          }
        );
        break;
      default:
        sendMessage(query);
    }
  };

  const quickActions = [
    {
      icon: BookOpen,
      label: 'Study Plan',
      mode: 'study-plan' as const,
      placeholder: 'Enter subjects (e.g., Data Structures, Algorithms, DBMS)'
    },
    {
      icon: HelpCircle,
      label: 'Assignment Help',
      mode: 'assignment' as const,
      placeholder: 'Describe your assignment or question'
    },
    {
      icon: Briefcase,
      label: 'Career Advice',
      mode: 'career' as const,
      placeholder: 'Enter your interests (e.g., AI, Web Dev, Mobile Apps)'
    },
    {
      icon: Bot,
      label: 'General Chat',
      mode: 'chat' as const,
      placeholder: 'Ask me anything about your studies...'
    }
  ];

  const currentPlaceholder = quickActions.find(action => action.mode === activeMode)?.placeholder || 'Type your message...';

  return (
    <div className="bg-slate-800 rounded-2xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Study Assistant</h3>
          <p className="text-slate-400 text-sm">Powered by Flan-T5</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {quickActions.map((action) => (
          <button
            key={action.mode}
            onClick={() => setActiveMode(action.mode)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
              activeMode === action.mode
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-100 p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentPlaceholder}
          className="flex-1 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
