import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Paperclip } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { talkToLlama } from './lib/Llama';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstResponse, setIsFirstResponse] = useState(true);

  // ✅ Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Load saved messages
  useEffect(() => {
    const stored = localStorage.getItem('healthbot_chat');
    if (stored) {
      setMessages(JSON.parse(stored));
      setIsFirstResponse(false);
    }
  }, []);

  // ✅ Save messages
  useEffect(() => {
    localStorage.setItem('healthbot_chat', JSON.stringify(messages));
  }, [messages]);

  // ✅ Auth
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    setError('');

    try {
      const llamaReply = await talkToLlama(userMessage);
      const response = isFirstResponse
        ? `Hello there! I'm HealthBot, trained by Raunaq Adlakha. 🤖\n\n${llamaReply}`
        : llamaReply;

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsFirstResponse(false);
    } catch (err) {
      console.error('🔥 Error from llama:', err);
      setError('❌ HealthBot could not respond. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    localStorage.removeItem('healthbot_chat');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm py-6 px-8 border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">HealthBot</h1>
          </div>
          <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-800 text-sm">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-blue-50 inline-block p-4 rounded-full mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to HealthBot!</h2>
              <p className="text-gray-500">Ask me anything related to health, remedies, symptoms, or lab tests.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-white shadow-sm rounded-full px-6 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">{attachment.name}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="ml-auto text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 text-gray-600 rounded-xl px-6 py-3 hover:bg-gray-200"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !attachment)}
              className="bg-blue-500 text-white rounded-xl px-6 py-3 hover:bg-blue-600"
            >
              <Send className="w-5 h-5" /> Send
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;
