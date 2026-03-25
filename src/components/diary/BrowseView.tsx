import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiaryEntry } from '@/types/diary';
import { format } from 'date-fns';

interface BrowseViewProps {
  entries: DiaryEntry[];
  onEntryClick?: (entry: DiaryEntry) => void;
}

export function BrowseView({ entries, onEntryClick }: BrowseViewProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Get unique emotions
  const emotions = useMemo(() => {
    const emotionSet = new Set<string>();
    entries.forEach((entry) => emotionSet.add(entry.emotion.toLowerCase()));
    return Array.from(emotionSet).sort();
  }, [entries]);

  // Filter entries by selected emotion
  const filteredEntries = useMemo(() => {
    if (!selectedEmotion) return entries;
    return entries.filter(
      (entry) => entry.emotion.toLowerCase() === selectedEmotion
    );
  }, [entries, selectedEmotion]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-8">
        <p className="font-serif text-xl text-muted-foreground/60 italic text-center">
          Nothing here yet.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6">
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
            All ({entries.length})
          </button>
          {emotions.map((emotion) => {
            const count = entries.filter(
              (e) => e.emotion.toLowerCase() === emotion
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

      {/* Entries list */}
      <div className="px-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              onClick={() => onEntryClick?.(entry)}
              className="bg-card rounded-xl p-5 shadow-soft cursor-pointer hover:shadow-medium transition-shadow duration-gentle"
            >
              {/* Line - visually strongest */}
              <blockquote className="font-serif text-lg leading-relaxed text-foreground mb-3">
                "{entry.line}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                {/* Emotion - softer */}
                <span className="px-3 py-1 rounded-full bg-accent/60 text-accent-foreground/80 text-sm capitalize">
                  {entry.emotion}
                </span>
                {/* Date - quiet, secondary */}
                <span className="text-xs text-muted-foreground/50">
                  {format(entry.createdAt, 'MMM yyyy')}
                </span>
              </div>

              {/* Meaning - softest */}
              {entry.meaning && (
                <p className="mt-3 text-sm text-muted-foreground/70 italic">
                  {entry.meaning}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
