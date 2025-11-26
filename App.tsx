
import React, { useState } from 'react';
import { ProfileSelector } from './components/ProfileSelector';
import { SubjectCard } from './components/SubjectCard';
import { GameScreen } from './components/GameScreen';
import { StickerBook } from './components/StickerBook';
import { RewardModal } from './components/RewardModal';
import { AgeProfile, Subject, GameState, Badge } from './types';

// Badge Configuration
const BADGES: Badge[] = [
  // Characters (Unlocked by total correct answers)
  { id: 'char_cat', name: 'Curious Cat', icon: '🐱', description: 'Solved 5 questions!', category: 'character' },
  { id: 'char_owl', name: 'Wise Owl', icon: '🦉', description: 'Solved 10 questions!', category: 'character' },
  { id: 'char_fox', name: 'Speedy Fox', icon: '🦊', description: 'Solved 25 questions!', category: 'character' },
  { id: 'char_robot', name: 'Robo-Pal', icon: '🤖', description: 'Solved 50 questions!', category: 'character' },
  { id: 'char_bear', name: 'Brainy Bear', icon: '🐻', description: 'Solved 75 questions!', category: 'character' },
  { id: 'char_unicorn', name: 'Magic Unicorn', icon: '🦄', description: 'Solved 100 questions!', category: 'character' },
  { id: 'char_dragon', name: 'Galaxy Dragon', icon: '🐲', description: 'Solved 150 questions!', category: 'character' },

  // Achievements (Specific triggers)
  { id: 'first_win', name: 'First Steps', icon: '🌱', description: 'Got your first correct answer!', category: 'achievement' },
  { id: 'on_fire', name: 'On Fire!', icon: '🔥', description: 'Got 3 in a row!', category: 'achievement' },
  { id: 'super_streak', name: 'Unstoppable', icon: '🚀', description: 'Got 10 in a row!', category: 'achievement' },
  { id: 'math_whiz', name: 'Math Whiz', icon: '🔢', description: 'Mastered 5 Math questions', category: 'achievement' },
  { id: 'word_wizard', name: 'Word Wizard', icon: '📚', description: 'Mastered 5 English questions', category: 'achievement' },
  { id: 'logic_legend', name: 'Logic Legend', icon: '🧠', description: 'Solved 5 Logic puzzles', category: 'achievement' },
  { id: 'puzzle_pro', name: 'Puzzle Pro', icon: '🧩', description: 'Solved 5 Puzzles', category: 'achievement' },
];

export default function App() {
  const [profile, setProfile] = useState<AgeProfile>('4yo');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [stats, setStats] = useState<GameState>({ score: 0, streak: 0, history: [], unlockedBadges: [] });
  const [rewardQueue, setRewardQueue] = useState<Badge[]>([]);

  const checkBadges = (currentStats: GameState, subject: Subject, isCorrect: boolean): string[] => {
    const newUnlockIds: string[] = [];
    const { history, streak, unlockedBadges } = currentStats;
    const totalCorrect = history.filter(h => h.correct).length;
    
    // Helper to check and add
    const check = (id: string, condition: boolean) => {
      if (condition && !unlockedBadges.includes(id) && !newUnlockIds.includes(id)) {
        newUnlockIds.push(id);
      }
    };

    // Check Characters
    check('char_cat', totalCorrect >= 5);
    check('char_owl', totalCorrect >= 10);
    check('char_fox', totalCorrect >= 25);
    check('char_robot', totalCorrect >= 50);
    check('char_bear', totalCorrect >= 75);
    check('char_unicorn', totalCorrect >= 100);
    check('char_dragon', totalCorrect >= 150);

    // Check Achievements
    check('first_win', totalCorrect >= 1);
    check('on_fire', streak >= 3);
    check('super_streak', streak >= 10);

    // Subject Specific
    const subjectHistory = history.filter(h => h.subject === subject && h.correct).length;
    if (subject === 'MATH') check('math_whiz', subjectHistory >= 5);
    if (subject === 'ENGLISH') check('word_wizard', subjectHistory >= 5);
    if (subject === 'LOGIC') check('logic_legend', subjectHistory >= 5);
    if (subject === 'PUZZLES') check('puzzle_pro', subjectHistory >= 5);

    return newUnlockIds;
  };

  const handleScoreUpdate = (isCorrect: boolean) => {
    // 1. Calculate new values
    const newStreak = isCorrect ? stats.streak + 1 : 0;
    const newScore = isCorrect ? stats.score + 10 : stats.score;
    const newHistory = [...stats.history, { correct: isCorrect, subject: subject! }];
    
    // 2. Prepare temp stats for checking badges
    const tempStats = {
        ...stats,
        score: newScore,
        streak: newStreak,
        history: newHistory
    };

    // 3. Check for new badges
    const newBadgeIds = checkBadges(tempStats, subject!, isCorrect);
    
    // 4. Update State
    setStats({
      ...tempStats,
      unlockedBadges: [...stats.unlockedBadges, ...newBadgeIds]
    });

    // 5. Queue rewards for display
    if (newBadgeIds.length > 0) {
      const newBadges = BADGES.filter(b => newBadgeIds.includes(b.id));
      setRewardQueue(prev => [...prev, ...newBadges]);
    }
  };

  const closeRewardModal = () => {
    setRewardQueue(prev => prev.slice(1));
  };

  const renderContent = () => {
    if (subject) {
      return (
        <GameScreen
          profile={profile}
          subject={subject}
          onBack={() => setSubject(null)}
          onScoreUpdate={handleScoreUpdate}
        />
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-pop-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 tracking-tight">
            Hi, {profile === '4yo' ? 'Little Explorer' : 'Junior Genius'}! 👋
          </h1>
          <p className="text-slate-500 text-lg">Pick a game to start learning</p>
        </div>

        <ProfileSelector currentProfile={profile} onSelect={setProfile} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
          <SubjectCard 
            subject="ENGLISH" 
            icon="🅰️" 
            color="bg-gradient-to-br from-pink-400 to-rose-500" 
            onClick={setSubject} 
          />
          <SubjectCard 
            subject="MATH" 
            icon="🔢" 
            color="bg-gradient-to-br from-blue-400 to-indigo-500" 
            onClick={setSubject} 
          />
          <SubjectCard 
            subject="LOGIC" 
            icon="🧩" 
            color="bg-gradient-to-br from-violet-400 to-purple-500" 
            onClick={setSubject} 
          />
          <SubjectCard 
            subject="PUZZLES" 
            icon="🕵️" 
            color="bg-gradient-to-br from-amber-400 to-orange-500" 
            onClick={setSubject} 
          />
        </div>

        {/* Stats Footer */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm flex justify-around items-center border border-slate-100">
          <div className="text-center">
            <span className="block text-3xl font-bold text-indigo-500">{stats.score}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Points</span>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div className="text-center">
             <span className="block text-3xl font-bold text-orange-500">🔥 {stats.streak}</span>
             <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Streak</span>
          </div>
        </div>

        {/* Sticker Book */}
        <StickerBook unlockedIds={stats.unlockedBadges} badges={BADGES} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans selection:bg-indigo-100 relative">
      {rewardQueue.length > 0 && (
        <RewardModal 
          badge={rewardQueue[0]} 
          onClose={closeRewardModal} 
        />
      )}
      {renderContent()}
    </div>
  );
}
