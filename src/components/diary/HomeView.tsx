import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { DiaryEntry } from '@/types/diary';
import { RandomLine } from './RandomLine';
import { AboutInfo } from './AboutInfo';
import { Button } from '@/components/ui/button';

interface HomeViewProps {
  entries: DiaryEntry[];
  onAddClick: () => void;
}

export function HomeView({ entries, onAddClick }: HomeViewProps) {
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const getRandomEntry = useCallback(() => {
    if (entries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
  }, [entries]);

  useEffect(() => {
    setCurrentEntry(getRandomEntry());
  }, [getRandomEntry]);

  // Show trust message once on first visit
  useEffect(() => {
    const hasSeenAbout = localStorage.getItem('diary-seen-about');
    if (!hasSeenAbout) {
      setShowAbout(true);
      localStorage.setItem('diary-seen-about', 'true');
    }
  }, []);

  const handleRefresh = () => {
    if (entries.length <= 1) return;
    let newEntry = getRandomEntry();
    let attempts = 0;
    while (newEntry?.id === currentEntry?.id && attempts < 10) {
      newEntry = getRandomEntry();
      attempts++;
    }
    setCurrentEntry(newEntry);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center paper-texture">
      {/* Main content - reading is primary */}
      <div className="flex-1 flex items-center justify-center w-full pb-32">
        <RandomLine entry={currentEntry} onRefresh={handleRefresh} />
      </div>

      {/* Trust message - shown once, quietly at bottom */}
      {showAbout && (
        <div className="fixed bottom-36 left-0 right-0 px-8">
          <AboutInfo />
        </div>
      )}

      {/* Add button - subtle, writing is secondary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.7, scale: 1 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="fixed bottom-24 right-6"
      >
        <Button
          onClick={onAddClick}
          size="lg"
          className="rounded-full w-12 h-12 shadow-soft bg-primary/80 text-primary-foreground hover:bg-primary hover:shadow-medium transition-all duration-gentle"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
