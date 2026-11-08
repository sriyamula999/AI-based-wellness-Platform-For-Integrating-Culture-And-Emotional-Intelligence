import React, { useState } from 'react';
import { Landmark, CheckCircle2, RotateCcw, MapPin, Sparkles } from 'lucide-react';

export default function DynastyGame({ onGameComplete, availableTempleIds = [] }) {
  const monuments = [
    { id: 'taj', name: "Taj Mahal", correctDynasty: "uttarpradesh", region: "North (Agra)", top: "35%", left: "42%" },
    { id: 'khajuraho', name: "Khajuraho", correctDynasty: "madhyapradesh", region: "Central India", top: "45%", left: "34%" },
    { id: 'konark', name: "Konark Sun Temple", correctDynasty: "odisha", region: "East (Odisha)", top: "52%", left: "58%" },
    { id: 'hampi', name: "Hampi Monuments", correctDynasty: "karnataka", region: "Deccan / South", top: "75%", left: "30%" },
    { id: 'brihad', name: "Brihadeeswara", correctDynasty: "tamilnadu", region: "Deep South", top: "86%", left: "38%" }
  ];

  const dynasties = [
    { id: 'uttarpradesh', name: "Uttar Pradesh Zone", territory: "Northern / Awadh Region", className: "top-[28%] left-[36%] w-36 h-24" },
    { id: 'madhyapradesh', name: "Madhya Pradesh Zone", territory: "Central Plateau", className: "top-[41%] left-[23%] w-40 h-28" },
    { id: 'odisha', name: "Odisha / Eastern Zone", territory: "Eastern Coast", className: "top-[49%] left-[50%] w-32 h-24" },
    { id: 'karnataka', name: "Karnataka Zone", territory: "Deccan South", className: "top-[67%] left-[23%] w-32 h-28" },
    { id: 'tamilnadu', name: "Tamil Nadu Zone", territory: "Southern Tip", className: "top-[78%] left-[31%] w-28 h-24" }
  ];

  const availableMonuments = monuments.filter(monument => availableTempleIds.includes(monument.id));

  const [droppedItems, setDroppedItems] = useState({
    uttarpradesh: [],
    madhyapradesh: [],
    odisha: [],
    karnataka: [],
    tamilnadu: []
  });

  const [draggedMonument, setDraggedMonument] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDragStart = (e, monument) => {
    setDraggedMonument(monument);
    e.dataTransfer.setData('text/plain', monument.id);
  };

  const handleDrop = (e, dynastyId) => {
    e.preventDefault();
    if (!draggedMonument || isCompleted) return;

    const isAlreadyPlaced = Object.values(droppedItems).some(list => list.some(m => m.id === draggedMonument.id));
    if (isAlreadyPlaced) return;

    const isCorrect = draggedMonument.correctDynasty === dynastyId;

    const updatedDropped = {
      ...droppedItems,
      [dynastyId]: [...droppedItems[dynastyId], { ...draggedMonument, isCorrect }]
    };

    setDroppedItems(updatedDropped);
    setDraggedMonument(null);

    let currentCorrectCount = 0;
    Object.values(updatedDropped).forEach(list => {
      list.forEach(item => {
        if (item.isCorrect) currentCorrectCount++;
      });
    });

    setScore(currentCorrectCount);

    const totalPlaced = Object.values(updatedDropped).reduce((acc, list) => acc + list.length, 0);
    if (totalPlaced === availableMonuments.length && currentCorrectCount === availableMonuments.length && availableMonuments.length > 0) {
      setIsCompleted(true);
      if (onGameComplete) onGameComplete();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetGame = () => {
    setDroppedItems({
      uttarpradesh: [],
      madhyapradesh: [],
      odisha: [],
      karnataka: [],
      tamilnadu: []
    });
    setScore(0);
    setIsCompleted(false);
  };

  const placedIds = new Set(Object.values(droppedItems).flatMap(list => list.map(m => m.id)));
  const unplacedMonuments = availableMonuments.filter(m => !placedIds.has(m.id));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#fffaf4] border border-[#c9e1d6] rounded-2xl shadow-xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">Dynasty Dominion: India Map Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">Drag completed monuments onto their correct regional territories on the map.</p>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 bg-[#edf7f2] hover:bg-[#dff3e9] rounded-lg text-[#176b4d] transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4" /> Reset Game
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Monument Deck */}
        <div className="bg-[#edf7f2] p-4 rounded-xl border border-[#c9e1d6] flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Landmark className="w-4 h-4" /> Monuments ({unplacedMonuments.length} left)
          </h3>
          
          <div className="flex flex-col gap-2.5 min-h-[380px]">
            {unplacedMonuments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                <Sparkles className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                <p className="text-xs">{availableMonuments.length ? 'All completed monuments positioned on the map!' : 'Complete a temple to add its location here.'}</p>
              </div>
            ) : (
              unplacedMonuments.map(monument => (
                <div
                  key={monument.id}
                  draggable={!isCompleted}
                  onDragStart={(e) => handleDragStart(e, monument)}
                  className="p-3 bg-[#fffaf4] border border-[#c9e1d6] rounded-lg cursor-grab active:cursor-grabbing hover:border-amber-400 transition-all shadow-md flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#12372a] group-hover:text-amber-400">{monument.name}</p>
                    <span className="text-[10px] text-slate-400">{monument.region}</span>
                  </div>
                  <span className="text-xs text-slate-500">⠿</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Map Container */}
        <div className="lg:col-span-2 relative bg-[#f4faf7] border-2 border-[#c9e1d6] rounded-2xl h-[580px] overflow-hidden shadow-inner flex items-center justify-center p-2">
          
          {/* Base Map Image loaded via direct vector source URL to bypass missing local file build errors */}
          <div className="absolute inset-4 flex items-center justify-center overflow-hidden">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/025/337/370/original/illustrated-map-of-india-with-states-and-territories-and-administrative-divisions-and-neighbouring-countries-editable-and-clearly-labeled-layers-vector.jpg" 
              alt="India Custom Map" 
              className="max-h-full max-w-full object-contain opacity-85 rounded-lg select-none pointer-events-none"
            />
          </div>

          <div className="absolute top-3 left-4 z-20 bg-[#fffaf4]/95 px-3 py-1 rounded-lg border border-[#c9e1d6] text-[10px] text-[#176b4d] font-mono shadow">
            TARGET MAP: ILLUSTRATED INDIA STATES
          </div>

          {dynasties.map((dynasty) => {
            const regionMonuments = droppedItems[dynasty.id] || [];
            return (
              <div
                key={dynasty.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dynasty.id)}
                style={{ position: 'absolute' }}
                className={`absolute ${dynasty.className} p-2 rounded-xl border-2 border-dashed transition-all flex flex-col justify-between backdrop-blur-xs z-10 ${
                  regionMonuments.length > 0 
                    ? 'bg-[#fffaf4]/55 border-amber-500 shadow-xl' 
                    : 'bg-[#edf7f2]/25 border-amber-400/50 hover:border-amber-400 hover:bg-[#fffaf4]/45'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-[#12372a] flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" /> {dynasty.name}
                  </span>
                </div>

                <div className="space-y-1 my-auto">
                  {regionMonuments.map(m => (
                    <div 
                      key={m.id}
                      className={`p-1 rounded text-[9px] font-medium flex items-center justify-between border animate-fade-in ${
                        m.isCorrect 
                          ? 'bg-green-950/90 border-green-500 text-green-200' 
                          : 'bg-red-950/90 border-red-500 text-red-200'
                      }`}
                    >
                      <span className="truncate pr-1">{m.name}</span>
                      <span className={`text-[8px] font-bold px-1 rounded ${m.isCorrect ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {m.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                  {regionMonuments.length === 0 && (
                    <span className="text-[8px] text-slate-400 italic block text-center">Drop here</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {isCompleted && (
        <div className="p-4 rounded-xl border bg-green-900/30 border-green-500/40 text-green-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-bold text-sm">All Regions Mapped Correctly! (Score: {score}/{availableMonuments.length})</p>
              <p className="text-xs text-slate-300">Great job placing the monuments onto your custom India map regions.</p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 animate-bounce" />
        </div>
      )}
    </div>
  );
}