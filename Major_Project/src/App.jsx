import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Ahara from './components/Ahara';
import Mandira from './components/Mandira';
import Dhyana from './components/Dhyana';
import Profile from './components/Profile'; // 👉 Imported Profile component

export default function App() {
  return (
    <Router 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-[#c9782d] selection:text-white">
        <Navbar />
        <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ahara" element={<Ahara />} />
            <Route path="/mandira" element={<Mandira />} />
            <Route path="/dhyana" element={<Dhyana />} />
            <Route path="/profile" element={<Profile />} /> {/* 👉 Added Profile Route */}
          </Routes>
        </main>
        <footer className="py-6 text-center text-xs text-slate-400 border-t border-white/5 mt-12">
          AI-Based Holistic Wellness Platform Integrating Culture & Emotional Intelligence © 2026
        </footer>
      </div>
    </Router>
  );
}