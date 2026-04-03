import { useState, useEffect, useCallback } from 'react';
import { DiaryEntry, WordEntry, DiaryState } from '@/types/diary';
import { supabase } from '@/lib/supabase';

// Map DB row (snake_case) → DiaryEntry (camelCase)
const rowToEntry = (row: any): DiaryEntry => ({
  id: row.id,
  line: row.line,
  emotion: row.emotion,
  author: row.author ?? undefined,
  meaning: row.meaning ?? undefined,
  languageNote: row.language_note ?? undefined,
  moment: row.moment ?? undefined,
  sourceType: row.source_type ?? undefined,
  createdAt: new Date(row.created_at),
});

const rowToWord = (row: any): WordEntry => ({
  id: row.id,
  word: row.word,
  meaning: row.meaning,
  sentence: row.sentence,
  emotion: row.emotion,
  createdAt: new Date(row.created_at),
});

export function useDiary() {
  const [state, setState] = useState<DiaryState>({ entries: [], words: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch all data when userId is available
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);

      const [entriesRes, wordsRes] = await Promise.all([
        supabase.from('diary_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('word_entries').select('*').order('created_at', { ascending: false }),
      ]);

      if (entriesRes.error) { setError(entriesRes.error.message); setIsLoading(false); return; }
      if (wordsRes.error) { setError(wordsRes.error.message); setIsLoading(false); return; }

      setState({
        entries: (entriesRes.data || []).map(rowToEntry),
        words: (wordsRes.data || []).map(rowToWord),
      });
      setIsLoading(false);
    };

    fetchAll();
  }, [userId]);

  const addEntry = useCallback(async (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: userId,
        line: entry.line,
        emotion: entry.emotion,
        author: entry.author ?? null,
        meaning: entry.meaning ?? null,
        language_note: entry.languageNote ?? null,
        moment: entry.moment ?? null,
        source_type: entry.sourceType ?? null,
      })
      .select()
      .single();

    if (error) { setError(error.message); return null; }

    const newEntry = rowToEntry(data);
    setState(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    return newEntry;
  }, [userId]);

  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => {
    const { error } = await supabase
      .from('diary_entries')
      .update({
        ...(updates.line !== undefined && { line: updates.line }),
        ...(updates.emotion !== undefined && { emotion: updates.emotion }),
        ...(updates.author !== undefined && { author: updates.author || null }),
        ...(updates.meaning !== undefined && { meaning: updates.meaning }),
        ...(updates.languageNote !== undefined && { language_note: updates.languageNote }),
        ...(updates.moment !== undefined && { moment: updates.moment }),
        ...(updates.sourceType !== undefined && { source_type: updates.sourceType }),
      })
      .eq('id', id);

    if (error) { setError(error.message); return; }

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  }, []);

  const addWord = useCallback(async (word: Omit<WordEntry, 'id' | 'createdAt'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('word_entries')
      .insert({
        user_id: userId,
        word: word.word,
        meaning: word.meaning,
        sentence: word.sentence,
        emotion: word.emotion,
      })
      .select()
      .single();

    if (error) { setError(error.message); return null; }

    const newWord = rowToWord(data);
    setState(prev => ({ ...prev, words: [newWord, ...prev.words] }));
    return newWord;
  }, [userId]);

  const updateWord = useCallback(async (id: string, updates: Partial<Omit<WordEntry, 'id' | 'createdAt'>>) => {
    const { error } = await supabase.from('word_entries').update(updates).eq('id', id);
    if (error) { setError(error.message); return; }
    setState(prev => ({
      ...prev,
      words: prev.words.map(w => w.id === id ? { ...w, ...updates } : w),
    }));
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    const { error } = await supabase.from('word_entries').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setState(prev => ({ ...prev, words: prev.words.filter(w => w.id !== id) }));
  }, []);

  const getRandomEntry = useCallback((): DiaryEntry | null => {
    if (state.entries.length === 0) return null;
    return state.entries[Math.floor(Math.random() * state.entries.length)];
  }, [state.entries]);

  const getEmotions = useCallback((): string[] => {
    const emotions = new Set<string>();
    state.entries.forEach(e => emotions.add(e.emotion.toLowerCase()));
    state.words.forEach(w => emotions.add(w.emotion.toLowerCase()));
    return Array.from(emotions).sort();
  }, [state.entries, state.words]);

  const getEntriesByEmotion = useCallback((emotion: string): DiaryEntry[] => {
    return state.entries.filter(e => e.emotion.toLowerCase() === emotion.toLowerCase());
  }, [state.entries]);

  const getWordsByEmotion = useCallback((emotion: string): WordEntry[] => {
    return state.words.filter(w => w.emotion.toLowerCase() === emotion.toLowerCase());
  }, [state.words]);

  const exportData = useCallback(() => {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      totalEntries: state.entries.length,
      totalWords: state.words.length,
      diaryEntries: state.entries.map(entry => ({
        line: entry.line,
        emotion: entry.emotion,
        author: entry.author || undefined,
        meaning: entry.meaning || undefined,
        languageNote: entry.languageNote || undefined,
        moment: entry.moment || undefined,
        sourceType: entry.sourceType || undefined,
        date: entry.createdAt.toISOString(),
      })),
      wordsILike: state.words.map(word => ({
        word: word.word,
        meaning: word.meaning,
        sentence: word.sentence,
        emotion: word.emotion,
        date: word.createdAt.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-diary-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback(async (jsonData: string): Promise<{ success: boolean; error?: string }> => {
    if (!userId) return { success: false, error: 'Not logged in' };

    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.diaryEntries && !parsed.wordsILike) {
        return { success: false, error: 'Invalid file format' };
      }

      const entryRows = (parsed.diaryEntries || []).map((e: any) => ({
        user_id: userId,
        line: e.line || '',
        emotion: e.emotion || '',
        author: e.author ?? null,
        meaning: e.meaning ?? null,
        language_note: e.languageNote ?? null,
        moment: e.moment ?? null,
        source_type: e.sourceType ?? null,
        created_at: new Date(e.date || e.createdAt || new Date()).toISOString(),
      }));

      const wordRows = (parsed.wordsILike || []).map((w: any) => ({
        user_id: userId,
        word: w.word || '',
        meaning: w.meaning || '',
        sentence: w.sentence || '',
        emotion: w.emotion || '',
        created_at: new Date(w.date || w.createdAt || new Date()).toISOString(),
      }));

      const [entriesRes, wordsRes] = await Promise.all([
        entryRows.length > 0 ? supabase.from('diary_entries').insert(entryRows) : Promise.resolve({ error: null }),
        wordRows.length > 0 ? supabase.from('word_entries').insert(wordRows) : Promise.resolve({ error: null }),
      ]);

      if (entriesRes.error) return { success: false, error: entriesRes.error.message };
      if (wordsRes.error) return { success: false, error: wordsRes.error.message };

      const [newEntries, newWords] = await Promise.all([
        supabase.from('diary_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('word_entries').select('*').order('created_at', { ascending: false }),
      ]);

      setState({
        entries: (newEntries.data || []).map(rowToEntry),
        words: (newWords.data || []).map(rowToWord),
      });

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Could not read file' };
    }
  }, [userId]);

  return {
    entries: state.entries,
    words: state.words,
    isLoading,
    error,
    userId,
    addEntry,
    updateEntry,
    deleteEntry,
    addWord,
    updateWord,
    deleteWord,
    getRandomEntry,
    getEmotions,
    getEntriesByEmotion,
    getWordsByEmotion,
    exportData,
    importData,
  };
}
