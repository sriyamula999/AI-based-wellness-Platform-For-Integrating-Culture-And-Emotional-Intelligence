import React, { useState } from 'react';
import { HeartPulse, Wind, CheckCircle2, Music, Play, Pause } from 'lucide-react';

export default function Dhyana() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const emotions = [
    { 
      name: 'Happy', 
      emoji: '😊', 
      raga: 'Raga Mohanam',
      krithi: 'VaraVeena (Geetham)',
      desc: 'A bright pentatonic scale evoking positive energy, celebration, and joyful harmony.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      breathing: 'Sama Vritti (Equal Breathing)',
      steps: [
        'Sit comfortably with your spine straight and shoulders relaxed.',
        'Inhale slowly through your nose for a count of 4 seconds.',
        'Hold your breath gently for a count of 4 seconds.',
        'Exhale smoothly through your nose for 4 seconds, then pause for 4 seconds.'
      ]
    },
    { 
      name: 'Sad', 
      emoji: '😢', 
      raga: 'Raga Kalyani',
      krithi: 'Alamelu Manga',
      desc: 'The queen of ragas; expands heart space, comforts melancholy, and brings inner peace.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      breathing: 'Bhramari Pranayama (Bee Breathing)',
      steps: [
        'Sit in a quiet space and close your eyes with a gentle expression.',
        'Place your index fingers lightly on the cartilage of your ears.',
        'Take a deep inhalation through your nose, then make a low humming sound on exhale.'
      ]
    },
    { 
      name: 'Stressed', 
      emoji: '😰', 
      raga: 'Raga Madhyamavathi',
      krithi: 'Adigi Sukhamu',
      desc: 'Serene and centered; traditionally played to clear anxiety and restore emotional calm.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      breathing: 'Nadi Shodhana (Alternate Nostril Breathing)',
      steps: [
        'Sit cross-legged with your left hand resting on your knee.',
        'Use your right thumb to close your right nostril and inhale through the left.',
        'Switch nostrils and exhale fully. Alternate sides for 3 to 5 minutes.'
      ]
    },
    { 
      name: 'Angry', 
      emoji: '😡', 
      raga: 'Raga Nilambari',
      krithi: 'Amba Neelayatakshi',
      desc: 'A cooling, gentle melody that washes away internal heat, frustration, and tension.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      breathing: 'Sheetali Pranayama (Cooling Breath)',
      steps: [
        'Curl your tongue into a tube shape and stick it out slightly past your lips.',
        'Inhale deeply through the curled tongue like drawing air through a straw.',
        'Close your mouth and exhale slowly through your nose to release internal heat and anger.'
      ]
    },
    { 
      name: 'Neutral', 
      emoji: '😐', 
      raga: 'Raga Kanada',
      krithi: 'Alai Payudhe',
      desc: 'Melodic and sweet, enhancing balanced awareness, clarity, and steady focus.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      breathing: 'Dirgha Pranayama (Three-Part Breath)',
      steps: [
        'Place one hand on your belly and the other on your chest.',
        'Inhale deeply expanding belly, ribcage, and upper chest sequentially.',
        'Exhale completely in reverse order to maintain deep mindfulness.'
      ]
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-400/30">
            <HeartPulse className="w-6 h-6 text-pink-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dhyana Module – Emotional Wellness</h1>
            <p className="text-slate-300 text-sm">Select your emotion to trigger automated audio therapy and structured breathing guidance.</p>
          </div>
        </div>
      </div>

      {/* Emoji Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 tracking-wide uppercase px-1">How are you feeling right now?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {emotions.map((emo) => {
            const isSelected = selectedEmotion?.name === emo.name;
            return (
              <div 
                key={emo.name}
                onClick={() => setSelectedEmotion(emo)}
                className={`glass-card rounded-2xl p-5 cursor-pointer flex flex-col items-center text-center space-y-2 transition-all ${
                  isSelected ? 'border-pink-500/80 bg-pink-500/15 shadow-lg shadow-pink-500/10 scale-105' : 'hover:border-white/20'
                }`}
              >
                <span className="text-3xl filter drop-shadow-md">{emo.emoji}</span>
                <span className="font-bold text-xs text-slate-100">{emo.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Recommendation Panel with Built-in Audio Player */}
      {selectedEmotion && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8 border border-pink-500/30 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedEmotion.emoji}</span>
              <div>
                <h3 className="text-lg font-bold">Prescription for: {selectedEmotion.name} State</h3>
                <p className="text-xs text-slate-400">Integrated Audio Stream & Breathing Therapy</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <Music className="w-4 h-4" /> {selectedEmotion.raga}
              </div>
              <div className="text-xs text-purple-300 font-medium">Composition: {selectedEmotion.krithi}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedEmotion.desc}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3 flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-pink-400" /> Now Playing Healing Track
              </span>
              <audio controls autoPlay key={selectedEmotion.audioUrl} className="w-full h-10 accent-pink-500 rounded-lg">
                <source src={selectedEmotion.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>

          {/* Yogic Breathing Steps */}
          <div className="glass-card rounded-2xl p-6 space-y-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
              <Wind className="w-4 h-4" /> Recommended Exercise: {selectedEmotion.breathing}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedEmotion.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed glass-input p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}