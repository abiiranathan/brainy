import React, { useState, useEffect, useCallback } from 'react';
import { AgeProfile, Subject, QuestionData } from '../types';
import { generateLesson, generateLessonImage, playTextToSpeech } from '../services/geminiService';

interface GameScreenProps {
  profile: AgeProfile;
  subject: Subject;
  onBack: () => void;
  onScoreUpdate: (isCorrect: boolean) => void;
}

// Internal Confetti Component
const Confetti = () => {
  const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
  const pieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bg: colors[Math.floor(Math.random() * colors.length)],
    delay: `${Math.random() * 0.5}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${8 + Math.random() * 8}px`
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece rounded-sm"
          style={{
            left: p.left,
            backgroundColor: p.bg,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
};

export const GameScreen: React.FC<GameScreenProps> = ({ profile, subject, onBack, onScoreUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuestionData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sound Effects Helper
  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
      // Cheerful ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'wrong') {
      // Low thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
        // Subtle click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
  };

  const loadQuestion = async () => {
    setLoading(true);
    setData(null);
    setImageUrl(null);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
    setShowConfetti(false);

    try {
      const qData = await generateLesson(subject, profile);
      setData(qData);
      
      if (profile === '4yo') {
        playTextToSpeech(qData.questionText, profile);
      }

      if (qData.requiresImage) {
        const img = await generateLessonImage(qData.visualDescription);
        setImageUrl(img);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (option: string) => {
    if (isCorrect !== null || !data) return;

    const correct = option === data.correctAnswer;
    setIsCorrect(correct);
    setSelectedOption(option);
    onScoreUpdate(correct);

    if (correct) {
        playSound('correct');
        setShowConfetti(true);
        // Encouraging TTS after a short delay so it doesn't clash with SFX
        setTimeout(() => playTextToSpeech("That's right! Amazing job!", profile), 500);
    } else {
        playSound('wrong');
        setTimeout(() => playTextToSpeech("Not quite, let's keep trying!", profile), 500);
    }
  };

  const speakQuestion = () => {
    if (data) playTextToSpeech(data.questionText, profile);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse px-4">
        <div className="text-8xl mb-6 animate-bounce">🤔</div>
        <p className="text-2xl font-bold text-slate-400 text-center">
            {profile === '4yo' ? "Thinking up a fun game..." : "Generating challenge..."}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-red-500 mb-4 font-bold">Oops! Brain freeze.</p>
        <button 
            onClick={loadQuestion} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-pop-in relative">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={() => { playSound('click'); onBack(); }}
            className="text-slate-500 hover:bg-white hover:shadow-md px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"
        >
            <span>🔙</span> Back
        </button>
        <button 
            onClick={() => { playSound('click'); speakQuestion(); }}
            className="bg-white text-indigo-500 hover:bg-indigo-50 border-2 border-indigo-100 p-3 rounded-full transition shadow-sm"
            title="Read question"
        >
            <span className="text-2xl">🔊</span>
        </button>
      </div>

      {/* Question Card */}
      <div className={`bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-4 ${isCorrect === false ? 'border-red-200 animate-shake' : 'border-indigo-50'} transition-colors duration-300`}>
        <div className="p-6 md:p-8 text-center">
            {imageUrl && (
                <div className="mb-6 flex justify-center">
                    <img 
                        src={imageUrl} 
                        alt="Question visual" 
                        className="rounded-2xl max-h-60 object-contain shadow-md border-4 border-slate-100"
                    />
                </div>
            )}
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                {data.questionText}
            </h2>
            
            {/* Hint Button for 8yo */}
            {profile === '8yo' && !isCorrect && isCorrect !== null && (
                 <button 
                 onClick={() => { playSound('click'); setShowHint(true); }}
                 className="text-sm text-indigo-400 mt-2 hover:text-indigo-600 font-semibold underline decoration-dotted underline-offset-4"
                >
                    Need a hint? 💡
                </button>
            )}
             {showHint && (
                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mt-4 text-sm font-medium animate-pop-in">
                    Start with: {data.hint}
                </div>
             )}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isWinner = isCorrect && isSelected;
            const isLoser = isCorrect === false && isSelected;
            const isDisabled = isCorrect !== null;

            let buttonClass = "bg-white hover:bg-slate-50 border-b-4 border-slate-200 text-slate-600 hover:translate-y-[-2px] hover:shadow-md";
            
            if (isWinner) {
                buttonClass = "bg-green-100 border-b-4 border-green-400 text-green-800 shadow-none translate-y-[2px]";
            } else if (isLoser) {
                buttonClass = "bg-red-100 border-b-4 border-red-400 text-red-800 shadow-none translate-y-[2px]";
            } else if (isDisabled) {
                buttonClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed";
            }
            
            return (
                <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isDisabled}
                    className={`
                        ${buttonClass}
                        p-6 rounded-2xl text-xl md:text-2xl font-bold transition-all duration-200
                        transform active:scale-95 active:border-b-0
                    `}
                >
                    {option}
                </button>
            );
        })}
      </div>

      {/* Next Button / Success Message */}
      {isCorrect && (
        <div className="mt-8 flex flex-col items-center animate-pop-in z-10 relative">
            <div className="text-3xl mb-4 font-bold text-green-500 drop-shadow-sm">
                🎉 Correct!
            </div>
            <button
                onClick={() => { playSound('click'); loadQuestion(); }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-200 transition transform hover:scale-110 active:scale-95 border-b-4 border-indigo-700 active:border-b-0"
            >
                Next Level ➜
            </button>
        </div>
      )}
    </div>
  );
};