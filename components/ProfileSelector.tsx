import React from 'react';
import { AgeProfile } from '../types';

interface ProfileSelectorProps {
  currentProfile: AgeProfile;
  onSelect: (profile: AgeProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ currentProfile, onSelect }) => {
  return (
    <div className="flex gap-4 justify-center mb-8">
      <button
        onClick={() => onSelect('4yo')}
        className={`relative group p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
          currentProfile === '4yo' 
            ? 'bg-sky-400 ring-4 ring-sky-200 shadow-xl scale-105' 
            : 'bg-white shadow-md opacity-70 hover:opacity-100'
        }`}
      >
        <div className="text-4xl mb-2">🎈</div>
        <div className="font-bold text-lg text-slate-700">Junior (4yo)</div>
        <div className="text-xs text-slate-500">Kindergarten</div>
        {currentProfile === '4yo' && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            Active
          </div>
        )}
      </button>

      <button
        onClick={() => onSelect('8yo')}
        className={`relative group p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
          currentProfile === '8yo' 
            ? 'bg-emerald-400 ring-4 ring-emerald-200 shadow-xl scale-105' 
            : 'bg-white shadow-md opacity-70 hover:opacity-100'
        }`}
      >
        <div className="text-4xl mb-2">🚀</div>
        <div className="font-bold text-lg text-slate-700">Senior (8yo)</div>
        <div className="text-xs text-slate-500">Primary 1</div>
        {currentProfile === '8yo' && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            Active
          </div>
        )}
      </button>
    </div>
  );
};
