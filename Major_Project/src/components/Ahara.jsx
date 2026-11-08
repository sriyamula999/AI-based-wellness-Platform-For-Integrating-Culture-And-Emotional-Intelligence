import React, { useState } from 'react';
import { Utensils, Send, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { askAhara } from '../config/api';

export default function Ahara() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am your Ahara assistant powered by the Ayurveda RAG knowledge base. Ask me about food, doshas, seasonal routines, or dietary principles.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);
    setError('');

    askAhara(userMsg)
      .then((data) => {
        const sources = data.sources?.length
          ? `\n\nSources: ${data.sources.map((source) => source.doc).join(', ')}`
          : '';
        const followups = data.followups?.length
          ? `\n\nYou could also ask: ${data.followups.join(' | ')}`
          : '';
        setMessages(prev => [...prev, { sender: 'ai', text: `${data.answer}${sources}${followups}` }]);
      })
      .catch((serviceError) => setError(serviceError.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30">
            <Utensils className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ahara Module – Food & Ayurvedic Wellness</h1>
            <p className="text-slate-300 text-sm">Retrieval-Augmented Generation (RAG) assistant for precise dietary guidance.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel rounded-2xl p-4 text-sm text-red-200 border border-red-400/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error} Start the Ayurveda service on port 5001 and try again.</span>
        </div>
      )}

      {/* Chat / Query Interface */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-purple-600/40 border border-purple-400/30 text-white rounded-br-none' 
                  : 'glass-card text-slate-200 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-card p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Retrieving knowledge base...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-3">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about food, doshas, or Ayurvedic recommendations..."
            className="flex-1 glass-input rounded-xl px-4 py-3 text-sm"
          />
          <button type="submit" className="px-5 py-3 rounded-xl bg-[#c9782d] border border-[#c9782d] text-white hover:bg-[#a95f20] transition-all flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}