import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { WordEntry } from '@/types/diary';
import { Button } from '@/components/ui/button';

interface WordsViewProps {
  words: WordEntry[];
  onAddClick: () => void;
  onWordClick?: (word: WordEntry) => void;
}

export function WordsView({ words, onAddClick, onWordClick }: WordsViewProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Get unique emotions
  const emotions = useMemo(() => {
    const emotionSet = new Set<string>();
    words.forEach((word) => emotionSet.add(word.emotion.toLowerCase()));
    return Array.from(emotionSet).sort();
  }, [words]);

  // Filter words by selected emotion
  const filteredWords = useMemo(() => {
    if (!selectedEmotion) return words;
    return words.filter(
      (word) => word.emotion.toLowerCase() === selectedEmotion
    );
  }, [words, selectedEmotion]);

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Words I Like</h1>
        <Button
          onClick={onAddClick}
          size="icon"
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {words.length === 0 ? (
        <div className="flex items-center justify-center h-64 px-8">
          <p className="font-serif text-xl text-muted-foreground/60 italic text-center">
            A place for words.
          </p>
        </div>
      ) : (
        <>
          {/* Emotion filters */}
          <div className="px-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEmotion(null)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-gentle ${
                  selectedEmotion === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                All ({words.length})
              </button>
              {emotions.map((emotion) => {
                const count = words.filter(
                  (w) => w.emotion.toLowerCase() === emotion
                ).length;
                return (
                  <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-gentle capitalize ${
                      selectedEmotion === emotion
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {emotion} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Words grid */}
          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onClick={() => onWordClick?.(word)}
                  className="bg-card rounded-xl p-5 shadow-soft cursor-pointer hover:shadow-medium transition-shadow duration-gentle"
                >
                  {/* Word - strongest */}
                  <h3 className="font-serif text-2xl text-foreground mb-2">
                    {word.word}
                  </h3>
                  
                  {/* Meaning - softer */}
                  <p className="text-muted-foreground/70 text-sm mb-3">
                    {word.meaning}
                  </p>

                  {/* Sentence - softer still */}
                  <p className="font-serif italic text-foreground/70 mb-4">
                    "{word.sentence}"
                  </p>

                  {/* Emotion - quiet accent */}
                  <span className="px-3 py-1 rounded-full bg-accent/60 text-accent-foreground/80 text-xs capitalize">
                    {word.emotion}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
