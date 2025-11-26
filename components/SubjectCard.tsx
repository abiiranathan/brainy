import React from 'react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onClick: (subject: Subject) => void;
  color: string;
  icon: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick, color, icon }) => {
  return (
    <button
      onClick={() => onClick(subject)}
      className={`${color} w-full aspect-square rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95`}
    >
      <span className="text-6xl filter drop-shadow-md">{icon}</span>
      <span className="font-bold text-white text-xl md:text-2xl tracking-wide uppercase">
        {subject}
      </span>
    </button>
  );
};
