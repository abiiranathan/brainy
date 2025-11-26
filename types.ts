
export type AgeProfile = '4yo' | '8yo';

export type Subject = 'ENGLISH' | 'MATH' | 'LOGIC' | 'PUZZLES';

export interface QuestionData {
  questionText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  visualDescription: string; // Used to generate an image if needed
  requiresImage: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'achievement' | 'character';
}

export interface GameState {
  score: number;
  streak: number;
  history: {
    correct: boolean;
    subject: Subject;
  }[];
  unlockedBadges: string[];
}

export interface GeneratedContent {
  question: QuestionData;
  imageUrl?: string;
  audioUrl?: string;
}
