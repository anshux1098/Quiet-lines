import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DiaryEntry } from '@/types/diary';
import { toast } from 'sonner';

interface RandomLineProps {
  entry: DiaryEntry | null;
  onRefresh?: () => void;
}

export function RandomLine({ entry, onRefresh }: RandomLineProps) {
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    setHintVisible(false);
    onRefresh?.();
  };

  if (!entry) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center px-8"
      >
        <p className="font-serif text-xl text-muted-foreground/40 italic">
          A quiet place.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="text-center px-6 max-w-2xl mx-auto cursor-pointer"
      onClick={handleTap}
    >
      <blockquote
        className="font-serif text-2xl md:text-3xl leading-relaxed text-foreground mb-6 diary-line cursor-text"
        onClick={(e) => {
          e.stopPropagation();
          void navigator.clipboard.writeText(entry.line);
          toast('Copied');
        }}
      >
        "{entry.line}"
      </blockquote>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-3"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-accent/60 text-accent-foreground/80 text-sm">
          {entry.emotion}
        </span>

        {entry.author ? (
          <p className="text-xs text-muted-foreground/70 italic">— {entry.author}</p>
        ) : null}

        {entry.moment && (
          <p className="text-muted-foreground/60 text-sm mt-4 italic">
            {entry.moment}
          </p>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: hintVisible ? 0.3 : 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 text-xs text-muted-foreground"
      >
        tap for another
      </motion.p>
    </motion.div>
  );
}
