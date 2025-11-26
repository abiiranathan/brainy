
import React, { useEffect } from 'react';
import { Badge } from '../types';

interface RewardModalProps {
  badge: Badge;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ badge, onClose }) => {
  useEffect(() => {
    // Auto-close sound effect could go here
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl border-4 border-yellow-300">
        
        {/* Background rays effect */}
        <div className="absolute inset-0 z-0 opacity-10 animate-[spin_10s_linear_infinite]">
            <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_15deg,theme(colors.yellow.400)_15deg_30deg,transparent_30deg_45deg,theme(colors.yellow.400)_45deg_60deg,transparent_60deg_75deg,theme(colors.yellow.400)_75deg_90deg,transparent_90deg_105deg,theme(colors.yellow.400)_105deg_120deg,transparent_120deg_135deg,theme(colors.yellow.400)_135deg_150deg,transparent_150deg_165deg,theme(colors.yellow.400)_165deg_180deg,transparent_180deg_195deg,theme(colors.yellow.400)_195deg_210deg,transparent_210deg_225deg,theme(colors.yellow.400)_225deg_240deg,transparent_240deg_255deg,theme(colors.yellow.400)_255deg_270deg,transparent_270deg_285deg,theme(colors.yellow.400)_285deg_300deg,transparent_300deg_315deg,theme(colors.yellow.400)_315deg_330deg,transparent_330deg_345deg,theme(colors.yellow.400)_345deg_360deg)]"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">New Unlock!</h2>
          <div className="text-8xl my-6 animate-bounce filter drop-shadow-lg">
            {badge.icon}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{badge.name}</h3>
          <p className="text-slate-500 mb-8 font-medium">{badge.description}</p>
          
          <button
            onClick={onClose}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xl font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            Awesome! 🤩
          </button>
        </div>
      </div>
    </div>
  );
};
