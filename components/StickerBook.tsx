
import React from 'react';
import { Badge } from '../types';

interface StickerBookProps {
  unlockedIds: string[];
  badges: Badge[];
}

export const StickerBook: React.FC<StickerBookProps> = ({ unlockedIds, badges }) => {
  const characters = badges.filter(b => b.category === 'character');
  const achievements = badges.filter(b => b.category === 'achievement');

  const renderGrid = (items: Badge[]) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {items.map(badge => {
        const isUnlocked = unlockedIds.includes(badge.id);
        return (
          <div 
            key={badge.id} 
            className={`
              aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 transition-all
              ${isUnlocked 
                ? 'bg-white border-indigo-100 shadow-sm' 
                : 'bg-slate-100 border-dashed border-slate-300 opacity-60'
              }
            `}
          >
            <div className={`text-4xl md:text-5xl mb-2 ${isUnlocked ? 'animate-wiggle' : 'filter grayscale blur-sm'}`}>
              {badge.icon}
            </div>
            {isUnlocked ? (
              <span className="text-xs font-bold text-slate-700 leading-tight">{badge.name}</span>
            ) : (
              <span className="text-xs font-bold text-slate-400">???</span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-indigo-50 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📖</span>
        <h2 className="text-2xl font-bold text-indigo-900">My Sticker Book</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-400 mb-3">Friends</h3>
        {renderGrid(characters)}
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-400 mb-3">Badges</h3>
        {renderGrid(achievements)}
      </div>
    </div>
  );
};
