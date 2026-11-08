import React, { useState, useEffect } from 'react';
import { User, Landmark, Sparkles, Calendar, Award, BookOpen, HeartPulse, CheckCircle2 } from 'lucide-react';
import { userApi } from '../config/api';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'Explorer',
    email: 'user@pranaai.com',
    completedTemplesCount: 0,
    totalTemplesCount: 0,
    totalCardsCollected: 0,
    totalCards: 0,
    yesterdayMood: 'Calm and Focused',
    streakDays: 5,
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('pranaai_user_email');
    if (savedEmail) {
      const namePrefix = savedEmail.split('@')[0];
      const formattedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

      setProfileData(prev => ({
        ...prev,
        email: savedEmail,
        name: formattedName
      }));
    }

    const userId = savedEmail || "local_user_1";
    fetch(userApi(`/profile/${userId}`))
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (data) {
          setProfileData(prev => ({ 
            ...prev, 
            completedTemplesCount: data.completedTemplesCount || 0,
            totalTemplesCount: data.totalTemplesCount || 0,
            totalCardsCollected: data.totalCardsCollected || 0,
            totalCards: data.totalCards || 0
          }));
        }
      })
      .catch(err => console.log("Using local profile data fallback:", err));
  }, []);

  const initials = profileData.name.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pt-28">
      
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0">
          {initials}
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              Wellness Explorer
            </span>
          </div>
          <p className="text-sm text-slate-400">{profileData.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> Active Streak: {profileData.streakDays} Days</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-pink-400" /> PranaAI Wellness Explorer</span>
          </div>
        </div>
      </div>

      {/* Progress & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Mandira: Completed Temples */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 space-y-3 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <Landmark className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-lg">Mandira</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#12372a]">{profileData.completedTemplesCount} <span className="text-base font-medium text-[#557267]">/ {profileData.totalTemplesCount}</span></p>
            <p className="text-xs text-slate-400 mt-1">Monuments Fully Restored</p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Grand secrets unlocked
          </div>
        </div>

        {/* Card Collections */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 space-y-3 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-purple-400">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-500/10 px-2.5 py-1 rounded-lg">Heritage Cards</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#12372a]">{profileData.totalCardsCollected} <span className="text-base font-medium text-[#557267]">/ {profileData.totalCards}</span></p>
            <p className="text-xs text-slate-400 mt-1">Flashcards Mastered</p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-purple-300">
            <Award className="w-4 h-4" /> Active learning progress
          </div>
        </div>

        {/* Yesterday's Mood Tracker */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 space-y-3 bg-slate-900/60 shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-pink-400">
            <HeartPulse className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider bg-pink-500/10 px-2.5 py-1 rounded-lg">Dhyana Check-in</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white capitalize">{profileData.yesterdayMood}</p>
            <p className="text-xs text-slate-400 mt-1">Recorded Mood for Yesterday</p>
          </div>
          <div className="pt-2 text-xs text-slate-300">
            Based on your emotional balance logs.
          </div>
        </div>

      </div>
    </div>
  );
}