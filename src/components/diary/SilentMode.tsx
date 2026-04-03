import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiaryEntry } from '@/types/diary';

type AutoAdvance = 'off' | '30s' | '1min';

interface SilentModeProps {
  entries: DiaryEntry[];
  onExit: () => void;
}

export function SilentMode({ entries, onExit }: SilentModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState<AutoAdvance>('off');

  const [shuffledEntries] = useState(() => {
    const shuffled = [...entries];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoAdvanceInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoAdvanceInterval = useCallback(() => {
    clearAutoAdvanceInterval();
    if (autoAdvance === 'off' || shuffledEntries.length === 0) return;
    const ms = autoAdvance === '30s' ? 30000 : 60000;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % shuffledEntries.length);
    }, ms);
  }, [autoAdvance, shuffledEntries.length, clearAutoAdvanceInterval]);

  useEffect(() => {
    startAutoAdvanceInterval();
    return () => clearAutoAdvanceInterval();
  }, [startAutoAdvanceInterval]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onExit();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % shuffledEntries.length);
      startAutoAdvanceInterval();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + shuffledEntries.length) % shuffledEntries.length);
      startAutoAdvanceInterval();
    }
  }, [shuffledEntries.length, onExit, startAutoAdvanceInterval]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % shuffledEntries.length);
      } else {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + shuffledEntries.length) % shuffledEntries.length);
      }
      startAutoAdvanceInterval();
    }
    setTouchStart(null);
  };

  if (shuffledEntries.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-background z-50 cursor-pointer"
        onClick={onExit}
      />
    );
  }

  const currentEntry = shuffledEntries[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-background z-50 silent-mode"
      onClick={onExit}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-full flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: direction * 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -30 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-2xl text-center"
          >
            <blockquote className="font-serif text-2xl md:text-4xl leading-relaxed text-foreground mb-8">
              "{currentEntry.line}"
            </blockquote>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm capitalize"
            >
              {currentEntry.emotion}
            </motion.span>
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {(['off', '30s', '1min'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAutoAdvance(opt)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors duration-gentle ${
                autoAdvance === opt
                  ? 'text-muted-foreground/80'
                  : 'text-muted-foreground/40 hover:text-muted-foreground/60'
              }`}
            >
              {opt === 'off' ? 'off' : opt}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {shuffledEntries.length}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
