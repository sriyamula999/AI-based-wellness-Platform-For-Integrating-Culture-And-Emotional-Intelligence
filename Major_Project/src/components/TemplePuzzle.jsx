import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Puzzle, RefreshCw, ShieldCheck } from 'lucide-react';

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

function shuffleTiles() {
  const tiles = Array.from({ length: TILE_COUNT }, (_, index) => index);
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [tiles[index], tiles[randomIndex]] = [tiles[randomIndex], tiles[index]];
  }
  if (tiles.every((tile, index) => tile === index)) return shuffleTiles();
  return tiles;
}

export default function TemplePuzzle({ templeName, imageUrl, onComplete }) {
  const [tiles, setTiles] = useState(shuffleTiles);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const revealTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(revealTimerRef.current), []);

  const selectTile = (index) => {
    if (isRevealing) return;
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    const updatedTiles = [...tiles];
    [updatedTiles[selectedIndex], updatedTiles[index]] = [updatedTiles[index], updatedTiles[selectedIndex]];
    setTiles(updatedTiles);
    setSelectedIndex(null);
    setVerificationMessage('');
  };

  const verifyPuzzle = () => {
    const solved = tiles.every((tile, tileIndex) => tile === tileIndex);
    if (!solved) {
      setVerificationMessage('The image is not in the correct order yet. Keep rearranging the tiles.');
      return;
    }

    setIsSolved(true);
    setIsRevealing(true);
    setVerificationMessage('Verified! The restored monument will be shown for 4 seconds.');
    revealTimerRef.current = setTimeout(() => {
      setIsRevealing(false);
      onComplete();
    }, 4000);
  };

  const resetPuzzle = () => {
    clearTimeout(revealTimerRef.current);
    setTiles(shuffleTiles());
    setSelectedIndex(null);
    setIsSolved(false);
    setIsRevealing(false);
    setVerificationMessage('');
  };

  const renderSolvedImage = () => (
    <div className="relative max-w-xl mx-auto aspect-square overflow-hidden rounded-xl border-2 border-green-400/70">
      <img src={imageUrl} alt={`${templeName} restored`} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-4 py-3 text-center text-sm font-semibold text-green-200">
        Verified restoration view
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Puzzle className="w-5 h-5" /> Restore {templeName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Arrange the image, then verify it before unlocking the monument&apos;s flashcards.</p>
        </div>
        <button onClick={resetPuzzle} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300" title="Reset puzzle" disabled={isRevealing}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isRevealing ? renderSolvedImage() : (
        <div className="grid grid-cols-3 gap-1 max-w-xl mx-auto aspect-square bg-slate-700 p-1 rounded-xl">
          {tiles.map((tile, index) => {
            const row = Math.floor(tile / GRID_SIZE);
            const column = tile % GRID_SIZE;
            return (
              <button
                key={`${tile}-${index}`}
                type="button"
                onClick={() => selectTile(index)}
                className={`relative overflow-hidden rounded-md border-2 transition-all ${selectedIndex === index ? 'border-amber-300 ring-2 ring-amber-400/60 scale-95' : 'border-slate-800'}`}
                aria-label={`Puzzle tile ${index + 1}`}
              >
                <span
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: `url("${imageUrl}")`,
                    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                    backgroundPosition: `${column * 50}% ${row * 50}%`,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {verificationMessage && (
        <p className={`text-center text-sm ${isRevealing ? 'text-green-300' : 'text-amber-300'}`}>
          {verificationMessage}
        </p>
      )}

      {!isRevealing && !isSolved && (
        <button
          type="button"
          onClick={verifyPuzzle}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg"
        >
          <ShieldCheck className="w-5 h-5" /> Verify Puzzle
        </button>
      )}

      {isSolved && !isRevealing && (
        <div className="p-4 bg-green-900/30 border border-green-500/40 rounded-xl flex items-center gap-3 text-green-300">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <div>
            <p className="font-bold text-sm">Puzzle verified</p>
            <p className="text-xs text-slate-300">Your flashcards are now unlocked.</p>
          </div>
        </div>
      )}
    </div>
  );
}
