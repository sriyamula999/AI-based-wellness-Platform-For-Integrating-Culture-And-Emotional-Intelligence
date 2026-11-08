import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Landmark, HeartPulse, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dff3e9] text-xs text-[#176b4d] border border-[#22875f]/20">
          <Cpu className="w-3.5 h-3.5" />
          <span>Bridging Ancient Wisdom & Modern Artificial Intelligence</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Holistic Wellness Powered By <span className="bg-gradient-to-r from-[#12372a] via-[#176b4d] to-[#2c9b6d] bg-clip-text text-transparent">Culture & Intelligence</span>
        </h1>
        <p className="text-[#557267] text-base sm:text-lg max-w-2xl mx-auto font-light">
          Experience a unified digital platform combining Ayurvedic nutrition, ancient Indian architectural heritage learning, and emotional intelligence wellness practices.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/ahara" className="px-6 py-3 rounded-xl bg-[#176b4d] text-white font-medium shadow-lg hover:bg-[#22875f] transition-all flex items-center gap-2">
            Explore Ahara <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dhyana" className="px-6 py-3 rounded-xl bg-white border border-[#22875f]/25 text-[#176b4d] font-medium hover:bg-[#edf7f2] transition-all">
            Check Emotional State
          </Link>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold">Ahara Module</h3>
            <p className="text-[#557267] text-sm leading-relaxed">
              RAG-powered Ayurvedic guidance delivering personalized food suggestions and dietary wellness tips based on curated knowledge bases.
            </p>
          </div>
          <Link to="/ahara" className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium hover:underline">
            Start Nutrition Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold">Mandira Module</h3>
            <p className="text-[#557267] text-sm leading-relaxed">
              Stage-wise structured exploration of ancient Indian temples, architecture history, construction methods, and cultural significance.
            </p>
          </div>
          <Link to="/mandira" className="inline-flex items-center gap-2 text-cyan-300 text-sm font-medium hover:underline">
            Begin Heritage Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-pink-300" />
            </div>
            <h3 className="text-xl font-bold">Dhyana Module</h3>
            <p className="text-[#557267] text-sm leading-relaxed">
              AI emotion detection providing tailored Carnatic raga recommendations and therapeutic yogic breathing exercises for mental balance.
            </p>
          </div>
          <Link to="/dhyana" className="inline-flex items-center gap-2 text-pink-300 text-sm font-medium hover:underline">
            Start Emotional Check-in <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* System Features */}
      <section className="glass-panel rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Unified Architecture & Secure Progress</h2>
          <p className="text-[#557267] text-sm leading-relaxed">
            Our multi-layered system coordinates user authentication, real-time feedback loops, and secure database persistence so your wellness path is seamlessly tracked across all sessions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-2xl text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto" />
            <div className="text-sm font-semibold">Secure Database</div>
            <div className="text-xs text-slate-400">Encrypted records</div>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center space-y-2">
            <Cpu className="w-6 h-6 text-blue-400 mx-auto" />
            <div className="text-sm font-semibold">RAG + AI Models</div>
            <div className="text-xs text-slate-400">Contextual answers</div>
          </div>
        </div>
      </section>
    </div>
  );
}