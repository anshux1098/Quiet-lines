// Types for the Soothing Personal Diary

export interface DiaryEntry {
  id: string;
  line: string; // The main text - poem, shayari, song lyric, etc.
  emotion: string; // Required - how this makes the user feel
  author?: string;
  meaning?: string; // User's interpretation
  languageNote?: string; // Beauty note about the language
  moment?: string; // Context/moment when this was added
  sourceType?: 'poem' | 'shayari' | 'song' | 'book' | 'other'; // Hidden by default
  createdAt: Date;
}

export interface WordEntry {
  id: string;
  word: string; // The word itself
  meaning: string; // User's own meaning (not dictionary)
  sentence: string; // User's own sentence
  emotion: string; // Vibe/emotion tag
  createdAt: Date;
}

export interface DiaryState {
  entries: DiaryEntry[];
  words: WordEntry[];
}

// A few emotion hints — purely optional, never enforced
// Users can (and should) type their own words
export const EMOTION_HINTS = [
  'longing',
  'quiet',
  'warm',
  'ache',
  'wonder',
  'tender',
] as const;
