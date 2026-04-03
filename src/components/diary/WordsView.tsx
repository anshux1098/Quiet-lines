import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { WordEntry } from '@/types/diary';
import { Button } from '@/components/ui/button';
import { EditWordDialog } from '@/components/diary/EditWordDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LONG_PRESS_MS = 500;

interface WordsViewProps {
  words: WordEntry[];
  onAddClick: () => void;
  onWordClick?: (word: WordEntry) => void;
  deleteWord: (id: string) => void | Promise<void>;
  updateWord: (id: string, updates: Partial<Omit<WordEntry, 'id' | 'createdAt'>>) => void | Promise<void>;
}

export function WordsView({
  words,
  onAddClick,
  onWordClick,
  deleteWord,
  updateWord,
}: WordsViewProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<WordEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WordEntry | null>(null);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!activeCardId) return;

    const handler = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && (e.target as HTMLElement).closest?.('[role="alertdialog"]')) return;

      const el = cardRefs.current.get(activeCardId);
      if (el && t && el.contains(t)) return;
      setActiveCardId(null);
    };

    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeCardId]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, [clearLongPressTimer]);

  const clearPendingClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  const emotions = useMemo(() => {
    const emotionSet = new Set<string>();
    words.forEach((word) => emotionSet.add(word.emotion.toLowerCase()));
    return Array.from(emotionSet).sort();
  }, [words]);

  const filteredWords = useMemo(() => {
    if (!selectedEmotion) return words;
    return words.filter(
      (word) => word.emotion.toLowerCase() === selectedEmotion
    );
  }, [words, selectedEmotion]);

  const activateCard = (id: string) => {
    setActiveCardId(id);
  };

  const handlePointerDown = (word: WordEntry, e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      longPressTriggeredRef.current = true;
      activateCard(word.id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, LONG_PRESS_MS);
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    clearLongPressTimer();
  };

  const handleCardClick = (word: WordEntry, e: React.MouseEvent) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      e.preventDefault();
      return;
    }
    if (activeCardId) {
      if (activeCardId === word.id) return;
      setActiveCardId(null);
      return;
    }
    clearPendingClick();
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onWordClick?.(word);
    }, 280);
  };

  const handleDoubleClick = (word: WordEntry, e: React.MouseEvent) => {
    e.preventDefault();
    clearPendingClick();
    activateCard(word.id);
  };

  const handleEditSave = (id: string, data: { word: string; emotion: string }) => {
    void updateWord(id, { word: data.word, emotion: data.emotion });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    void deleteWord(id);
    setDeleteTarget(null);
    if (activeCardId === id) setActiveCardId(null);
  };

  return (
    <div className="pb-24 pt-6">
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
          <div className="px-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
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
                    type="button"
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

          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  ref={(el) => setCardRef(word.id, el)}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onPointerDown={(e) => handlePointerDown(word, e)}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  onPointerLeave={handlePointerEnd}
                  onDoubleClick={(e) => handleDoubleClick(word, e)}
                  onClick={(e) => handleCardClick(word, e)}
                  className="relative bg-card rounded-xl p-5 shadow-soft cursor-pointer hover:shadow-medium transition-shadow duration-gentle select-none touch-manipulation"
                >
                  <h3 className="font-serif text-2xl text-foreground mb-2 pr-14">
                    {word.word}
                  </h3>

                  <p className="text-muted-foreground/70 text-sm mb-3">
                    {word.meaning}
                  </p>

                  <p className="font-serif italic text-foreground/70 mb-4">
                    "{word.sentence}"
                  </p>

                  <span className="inline-block px-3 py-1 rounded-full bg-accent/60 text-accent-foreground/80 text-xs capitalize">
                    {word.emotion}
                  </span>

                  <AnimatePresence>
                    {activeCardId === word.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute bottom-3 right-3 flex gap-1.5 z-10"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Edit word"
                          onClick={() => {
                            setEditingWord(word);
                            setActiveCardId(null);
                          }}
                          className="rounded-lg p-2 bg-muted/80 text-muted-foreground shadow-soft hover:bg-accent/80 hover:text-accent-foreground transition-colors duration-gentle"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete word"
                          onClick={() => setDeleteTarget(word)}
                          className="rounded-lg p-2 bg-muted/80 text-muted-foreground shadow-soft hover:bg-accent/80 hover:text-accent-foreground transition-colors duration-gentle"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <EditWordDialog
        isOpen={!!editingWord}
        wordEntry={editingWord}
        onClose={() => setEditingWord(null)}
        onSave={handleEditSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this word?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
