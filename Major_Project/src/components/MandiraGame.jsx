import React, { useState } from 'react';
import { Trophy, RefreshCw, CheckCircle2, ArrowUpDown } from 'lucide-react';

const sequenceEvents = {
  'taj-mahal': [
    ['Construction commissioned by Emperor Shah Jahan', '1632'],
    ['Main architectural elements and double dome completed', '1648'],
    ['Mumtaz Mahal mausoleum complex completed', '1653'],
    ['Designated as a UNESCO World Heritage Site', '1983']
  ],
  'konark-sun-temple': [
    ['Construction commissioned by King Narasimhadeva I', '1250'],
    ['Chariot form with 24 carved wheels completed', '1260'],
    ['Main sanctuary tower fell into ruin', '1600'],
    ['Designated as a UNESCO World Heritage Site', '1984']
  ],
  'khajuraho-temples': [
    ['Chandela temple construction begins', '885'],
    ['Major temple building period reaches its height', '1000'],
    ['Temples are gradually overgrown and abandoned', '1300'],
    ['Khajuraho is rediscovered and documented', '1838']
  ],
  hampi: [
    ['Vijayanagara capital is founded by Harihara and Bukka', '1336'],
    ['Hampi reaches its cultural and trading peak', '1500'],
    ['Battle of Talikota leads to the city being sacked', '1565'],
    ['Hampi is designated as a UNESCO World Heritage Site', '1986']
  ],
  'brihadeeswara-temple': [
    ['Rajaraja I commissions the great Chola temple', '1003'],
    ['Brihadeeswara Temple is completed', '1010'],
    ['The temple becomes part of the Great Living Chola Temples', '1987'],
    ['The Chola Temples are expanded as a UNESCO heritage group', '2004']
  ]
};

function createEvents(templeId) {
  return (sequenceEvents[templeId] || sequenceEvents['taj-mahal']).map(([text, year], index) => ({
    id: index + 1,
    text,
    year
  }));
}

export default function MandiraGame({ templeId = 'taj-mahal', templeName = "Taj Mahal", onGameComplete }) {
  const initialEvents = createEvents(templeId);

  const [events, setEvents] = useState(() => [...initialEvents].sort(() => Math.random() - 0.5));
  const [isSolved, setIsSolved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Move item up in the list
  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...events];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setEvents(updated);
    setIsSolved(false);
    setErrorMessage("");
  };

  // Move item down in the list
  const moveDown = (index) => {
    if (index === events.length - 1) return;
    const updated = [...events];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setEvents(updated);
    setIsSolved(false);
    setErrorMessage("");
  };

  // Check if current order matches the chronological year order (1 -> 2 -> 3 -> 4)
  const checkAnswer = () => {
    for (let i = 0; i < events.length - 1; i++) {
      if (events[i].id > events[i + 1].id) {
        setErrorMessage("Not quite right yet! Check the timeline sequence and try shifting them again.");
        return;
      }
    }
    setIsSolved(true);
    setErrorMessage("");
    if (onGameComplete) onGameComplete();
  };

  // Reset puzzle
  const resetGame = () => {
    setEvents([...initialEvents].sort(() => Math.random() - 0.5));
    setIsSolved(false);
    setErrorMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#fffaf4] border border-[#c9e1d6] rounded-2xl shadow-xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">Chrono-Timeline: {templeName}</h2>
          <p className="text-xs text-slate-400 mt-1">Arrange the historical milestones in correct chronological order to learn the sequence of events!</p>
        </div>
        <button 
          onClick={resetGame}
            className="p-2 bg-[#edf7f2] hover:bg-[#dff3e9] rounded-lg text-[#176b4d] transition-all"
          title="Shuffle / Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {events.map((item, index) => (
          <div 
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              isSolved 
                ? 'bg-green-950/30 border-green-500/50 text-green-200' 
                : 'bg-[#edf7f2] border-[#c9e1d6] text-[#12372a] hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#dff3e9] flex items-center justify-center text-xs font-bold text-amber-600">
                {index + 1}
              </span>
              <p className="text-sm font-medium">{item.text}</p>
            </div>

            {!isSolved && (
                <div className="flex items-center gap-1 border-l border-[#c9e1d6] pl-3">
                <button 
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-[#dff3e9] rounded disabled:opacity-30 text-[#176b4d]"
                  title="Move Up"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveDown(index)}
                  disabled={index === events.length - 1}
                  className="p-1.5 hover:bg-[#dff3e9] rounded disabled:opacity-30 text-[#176b4d]"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedback & Actions */}
      {errorMessage && (
        <p className="text-xs text-red-400 font-medium text-center">{errorMessage}</p>
      )}

      {!isSolved ? (
        <button 
          onClick={checkAnswer}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg"
        >
          Verify Sequence <ArrowUpDown className="w-4 h-4" />
        </button>
      ) : (
        <div className="p-4 bg-green-900/30 border border-green-500/40 rounded-xl flex items-center justify-between text-green-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-bold text-sm">Timeline Mastered!</p>
              <p className="text-xs text-slate-300">You successfully mapped the chronological history.</p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
      )}
    </div>
  );
}