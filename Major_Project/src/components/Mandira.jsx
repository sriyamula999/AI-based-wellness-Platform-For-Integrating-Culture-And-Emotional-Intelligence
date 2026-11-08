import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Landmark, ArrowRight, Download, Lock, Unlock, ArrowLeft, Gamepad2, BookOpen, Map, Sparkles } from 'lucide-react';
import MandiraGame from './MandiraGame';
import DynastyGame from './DynastyGame';
import { mandiraApi } from '../config/api';
import TemplePuzzle from './TemplePuzzle';

export default function Mandira() {
  const [temples, setTemples] = useState([]);
  const [activeTemple, setActiveTemple] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [progress, setProgress] = useState(0); 
  const [grandSecret, setGrandSecret] = useState(null);
  
  // Main view toggle: 'temples' vs 'games'
  const [mainTab, setMainTab] = useState('temples');
  
  // Standalone game selection inside Games Hub: null, 'timeline', or 'dynasty'
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedSequenceTemple, setSelectedSequenceTemple] = useState(null);
  
  // 👉 FIX: Use the exact email saved in localStorage so it syncs with your profile page
  const userId = localStorage.getItem('pranaai_user_email') || "local_user_1";
  const captureRef = useRef(null);

  const loadTemples = () => {
    fetch(`${mandiraApi('/temples')}?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => setTemples(data))
      .catch(err => console.error("Error fetching temples:", err));
  };

  // 1. Load Dashboard Temples
  useEffect(() => {
    loadTemples();
  }, []);

  // 2. Select Temple & Load Data
  const handleSelectTemple = async (temple) => {
    if (!temple.unlocked) return;
    setActiveTemple(temple);
    setFlashcards([]);

    if (temple.puzzleCompleted) {
      const cardsRes = await fetch(`${mandiraApi(`/${temple.templeId}/flashcards`)}?userId=${encodeURIComponent(userId)}`);
      const cardsData = await cardsRes.json();
      setFlashcards(cardsData);
    }

    setProgress(0);
    setGrandSecret(null);
  };

  const handlePuzzleComplete = async () => {
    const response = await fetch(mandiraApi(`/${activeTemple.templeId}/puzzle-complete`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Puzzle completion could not be saved.');

    const cardsRes = await fetch(`${mandiraApi(`/${activeTemple.templeId}/flashcards`)}?userId=${encodeURIComponent(userId)}`);
    const cardsData = await cardsRes.json();
    setFlashcards(cardsData);
    setActiveTemple(prev => ({ ...prev, puzzleCompleted: true }));
    loadTemples();
  };

  // 3. Complete Flashcard Activity (Fixed sequential incrementing bug)
  const handleCompleteActivity = async () => {
    const currentCard = flashcards[progress];
    if (!currentCard) return;

    try {
      const res = await fetch(mandiraApi('/progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, templeId: activeTemple.templeId, cardId: currentCard.id })
      });
      const data = await res.json();
      
      // Safely increment step-by-step to prevent jumping straight to completion
      const nextProgress = progress + 1;
      setProgress(nextProgress);

      if (nextProgress >= activeTemple.totalCards || data.isFullyUnlocked) {
        unlockReward();
      }
    } catch (err) {
      console.error("Error saving progress:", err);
      // Fallback local increment if backend sync lags so user isn't blocked
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      if (nextProgress >= activeTemple.totalCards) {
        unlockReward();
      }
    }
  };

  // 4. Unlock Final Secret
  const unlockReward = async () => {
    try {
      const res = await fetch(mandiraApi(`/${activeTemple.templeId}/reward/${userId}`));
      const data = await res.json();
      if (data.unknownSecret) {
        setGrandSecret(data.unknownSecret);
      }
    } catch (err) {
      console.error("Error fetching reward:", err);
      setGrandSecret("A marvelous historical monument built with magnificent architectural mastery.");
    }
  };

  // 5. Download Completed Image
  const handleDownload = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { useCORS: true });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = `${activeTemple.name}-Secret.png`;
    link.click();
  };

  // ==========================================
  // VIEW A: MAIN DASHBOARD (No Temple Selected)
  // ==========================================
  if (!activeTemple) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[#12372a]">
            <Landmark className="w-8 h-8 text-amber-500" /> Mandira: Heritage Explorer
          </h1>

          {/* Main Toggle Switch: Temples vs Games Hub */}
          <div className="flex bg-[#edf7f2] p-1.5 rounded-xl border border-[#c9e1d6] shadow-inner">
            <button 
              onClick={() => { setMainTab('temples'); setSelectedGame(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mainTab === 'temples' 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-slate-300 hover:text-[#176b4d]'
              }`}
            >
              <Landmark className="w-4 h-4" /> Temples & Monuments
            </button>
            <button 
              onClick={() => setMainTab('games')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mainTab === 'games' 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-slate-300 hover:text-[#176b4d]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> Games Hub
            </button>
          </div>
        </div>

        {/* Conditional rendering based on main tab */}
        {mainTab === 'temples' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {temples.map(t => (
              <div 
                key={t.templeId} 
                onClick={() => handleSelectTemple(t)}
                className={`p-5 border rounded-xl transition-colors bg-slate-900 shadow-lg ${t.unlocked ? 'border-slate-700 cursor-pointer hover:bg-slate-800' : 'border-slate-800 opacity-60 cursor-not-allowed'}`}
              >
                <h3 className="font-bold text-lg text-[#12372a]">{t.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{t.location}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Lock className="w-4 h-4" /> {t.unlocked ? (t.puzzleCompleted ? `Uncover ${t.totalCards} Secrets` : 'Complete puzzle to begin') : 'Complete the previous monument first'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Games Hub View
          <div className="space-y-6">
            {!selectedGame ? (
              <div className="bg-[#fffaf4] p-6 rounded-2xl border border-[#c9e1d6] space-y-6 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">Interactive Heritage Games Hub</h2>
                  <p className="text-sm text-slate-300 mt-1">Choose a game below to test your historical and architectural expertise!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => { setSelectedGame('timeline'); setSelectedSequenceTemple(null); }}
                    className="p-6 bg-[#fff0dc] border border-[#e6c49d] hover:border-[#c9782d] rounded-xl space-y-3 cursor-pointer group transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#f7d9ae] group-hover:bg-[#c9782d] group-hover:text-white transition-colors">
                          <Gamepad2 className="w-6 h-6" />
                        </div>
                        <span>Chrono-Timeline Challenge</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">Test your skills by sequencing historical milestones of monuments in the correct chronological order.</p>
                  </div>

                  <div 
                    onClick={() => setSelectedGame('dynasty')}
                    className="p-6 bg-[#dff5f2] border border-[#a8d8ce] hover:border-[#22875f] rounded-xl space-y-3 cursor-pointer group transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#bfe8df] group-hover:bg-[#22875f] group-hover:text-white transition-colors">
                          <Map className="w-6 h-6" />
                        </div>
                        <span>Dynasty Dominion Map</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">Match heritage sites to the powerful ruling dynasties and regions responsible for their creation.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedGame(null)} 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#176b4d]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Games Hub
                </button>
                {selectedGame === 'timeline' ? (
                  selectedSequenceTemple ? (
                    <MandiraGame
                      templeId={selectedSequenceTemple.templeId}
                      templeName={selectedSequenceTemple.name}
                      onGameComplete={() => loadTemples()}
                    />
                  ) : (
                    <div className="bg-[#fffaf4] p-6 rounded-2xl border border-[#c9e1d6] space-y-5">
                      <div>
                        <h2 className="text-2xl font-bold text-[#176b4d]">Monument Sequence Games</h2>
                        <p className="text-sm text-[#557267] mt-1">Complete a monument&apos;s flashcards to unlock its historical sequence challenge.</p>
                      </div>
                      {temples.filter(temple => temple.isFullyUnlocked).length === 0 ? (
                        <p className="p-4 rounded-xl bg-[#edf7f2] text-sm text-[#557267] border border-[#c9e1d6]">
                          Complete all flashcards for a monument to unlock its sequence game.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {temples.filter(temple => temple.isFullyUnlocked).map(temple => (
                            <button
                              key={temple.templeId}
                              type="button"
                              onClick={() => setSelectedSequenceTemple(temple)}
                              className="text-left p-4 rounded-xl bg-[#fff0dc] border border-[#e6c49d] hover:border-[#c9782d] transition-all"
                            >
                              <p className="font-bold text-[#12372a]">{temple.name}</p>
                              <p className="text-xs text-[#557267] mt-1">Sequence challenge unlocked</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <DynastyGame availableTempleIds={temples.filter(temple => temple.isFullyUnlocked).map(temple => ({
                    'taj-mahal': 'taj',
                    'khajuraho-temples': 'khajuraho',
                    'konark-sun-temple': 'konark',
                    hampi: 'hampi',
                    'brihadeeswara-temple': 'brihad'
                  }[temple.templeId])).filter(Boolean)} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW B: ACTIVE TEMPLE WORKSPACE (Learning Only)
  // ==========================================
  const isComplete = progress >= activeTemple.totalCards;
  const activeCard = flashcards[progress] || flashcards[flashcards.length - 1];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => setActiveTemple(null)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#176b4d]">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      {!activeTemple.puzzleCompleted ? (
        <TemplePuzzle
          templeName={activeTemple.name}
          imageUrl={activeTemple.masterImageUrl}
          onComplete={handlePuzzleComplete}
        />
      ) : <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Image Reveal Container */}
        <div 
          ref={captureRef}
          className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col justify-end"
        >
          <img 
            src={activeTemple.masterImageUrl} 
            alt={activeTemple.name}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous" 
          />
          
          {!isComplete && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 z-10">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`bg-slate-950/95 border border-slate-800 transition-opacity duration-1000 ${i < progress ? 'opacity-0' : 'opacity-100'}`}
                />
              ))}
            </div>
          )}

          {isComplete && grandSecret && (
            <div className="relative z-25 bg-[#fffaf4]/95 backdrop-blur-sm p-4 m-4 rounded-xl border border-[#c9782d]/70 shadow-lg">
              <h4 className="text-[#a95f20] font-bold flex items-center gap-2 mb-2">
                <Unlock className="w-5 h-5" /> {activeTemple.name} Unlocked
              </h4>
              <p className="text-sm text-[#12372a]">{grandSecret}</p>
            </div>
          )}
        </div>

        {/* Right: Flashcard Learning Module */}
        <div className="flex flex-col justify-center">
          {!isComplete ? (
            <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                Tile {progress + 1} of {activeTemple.totalCards}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Learning Module
              </div>
              <h2 className="text-xl font-bold text-amber-400 mb-4">{activeCard?.title}</h2>
              <p className="text-slate-200 leading-relaxed min-h-[100px]">{activeCard?.content}</p>
              
              <button 
                onClick={handleCompleteActivity}
                className="mt-8 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg"
              >
                Complete & Reveal Tile <Sparkles className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-green-900/20 border border-green-500/30 text-center space-y-4">
              <Unlock className="w-12 h-12 text-green-400 mx-auto" />
              <h2 className="text-2xl font-bold text-green-400">Monument Fully Restored</h2>
              <p className="text-slate-300">You have uncovered the grand secret of {activeTemple.name}.</p>
              <button 
                onClick={handleDownload}
                className="mt-4 w-full py-3 bg-slate-100 hover:bg-white text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" /> Download Digital Souvenir
              </button>
            </div>
          )}
        </div>

      </div>}
    </div>
  );
}