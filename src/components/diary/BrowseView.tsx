import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X } from 'lucide-react';
import { DiaryEntry } from '@/types/diary';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EditLineDialog } from '@/components/diary/EditLineDialog';
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

interface BrowseViewProps {
  entries: DiaryEntry[];
  onEntryClick?: (entry: DiaryEntry) => void;
  deleteEntry: (id: string) => void | Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => void | Promise<void>;
}

export function BrowseView({
  entries,
  onEntryClick,
  deleteEntry,
  updateEntry,
}: BrowseViewProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiaryEntry | null>(null);

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

  const queryLower = searchQuery.trim().toLowerCase();

  const entriesMatchingSearch = useMemo(() => {
    if (!queryLower) return entries;
    return entries.filter((entry) => {
      const line = (entry.line || '').toLowerCase();
      const meaning = (entry.meaning || '').toLowerCase();
      return line.includes(queryLower) || meaning.includes(queryLower);
    });
  }, [entries, queryLower]);

  const emotions = useMemo(() => {
    const emotionSet = new Set<string>();
    entriesMatchingSearch.forEach((entry) => emotionSet.add(entry.emotion.toLowerCase()));
    return Array.from(emotionSet).sort();
  }, [entriesMatchingSearch]);

  const filteredEntries = useMemo(() => {
    if (!selectedEmotion) return entriesMatchingSearch;
    return entriesMatchingSearch.filter(
      (entry) => entry.emotion.toLowerCase() === selectedEmotion
    );
  }, [entriesMatchingSearch, selectedEmotion]);

  const activateCard = (id: string) => {
    setActiveCardId(id);
  };

  const handlePointerDown = (entry: DiaryEntry, e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      longPressTriggeredRef.current = true;
      activateCard(entry.id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, LONG_PRESS_MS);
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    clearLongPressTimer();
  };

  const handleCardClick = (entry: DiaryEntry, e: React.MouseEvent) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      e.preventDefault();
      return;
    }
    if (activeCardId) {
      if (activeCardId === entry.id) return;
      setActiveCardId(null);
      return;
    }
    clearPendingClick();
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onEntryClick?.(entry);
    }, 280);
  };

  const handleDoubleClick = (entry: DiaryEntry, e: React.MouseEvent) => {
    e.preventDefault();
    clearPendingClick();
    activateCard(entry.id);
  };

  const handleEditSave = (id: string, data: { line: string; emotion: string; author: string }) => {
    void updateEntry(id, { line: data.line, emotion: data.emotion, author: data.author });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    void deleteEntry(id);
    setDeleteTarget(null);
    if (activeCardId === id) setActiveCardId(null);
  };

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
      <div className="px-4 mb-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Search lines and meanings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

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
            All ({entriesMatchingSearch.length})
          </button>
          {emotions.map((emotion) => {
            const count = entriesMatchingSearch.filter(
              (e) => e.emotion.toLowerCase() === emotion
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

      <div className="px-4 space-y-4">
        {filteredEntries.length === 0 ? (
          <p className="font-serif text-center text-muted-foreground/60 italic py-12">
            No matches.
          </p>
        ) : null}
        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              ref={(el) => setCardRef(entry.id, el)}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              onPointerDown={(e) => handlePointerDown(entry, e)}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
              onDoubleClick={(e) => handleDoubleClick(entry, e)}
              onClick={(e) => handleCardClick(entry, e)}
              className="relative bg-card rounded-xl p-5 shadow-soft cursor-pointer hover:shadow-medium transition-shadow duration-gentle select-none touch-manipulation"
            >
              <blockquote
                className="font-serif text-lg leading-relaxed text-foreground mb-3 pr-14 cursor-text"
                onClick={(e) => {
                  e.stopPropagation();
                  void navigator.clipboard.writeText(entry.line);
                  toast('Copied');
                }}
              >
                "{entry.line}"
              </blockquote>

              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 items-start min-w-0">
                  <span className="px-3 py-1 rounded-full bg-accent/60 text-accent-foreground/80 text-sm capitalize">
                    {entry.emotion}
                  </span>
                  {entry.author ? (
                    <p className="text-xs text-muted-foreground/70 italic">— {entry.author}</p>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground/50 shrink-0 pt-1">
                  {format(entry.createdAt, 'MMM yyyy')}
                </span>
              </div>

              {entry.meaning && (
                <p className="mt-3 text-sm text-muted-foreground/70 italic">
                  {entry.meaning}
                </p>
              )}

              <AnimatePresence>
                {activeCardId === entry.id && (
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
                      aria-label="Edit line"
                      onClick={() => {
                        setEditingEntry(entry);
                        setActiveCardId(null);
                      }}
                      className="rounded-lg p-2 bg-muted/80 text-muted-foreground shadow-soft hover:bg-accent/80 hover:text-accent-foreground transition-colors duration-gentle"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete line"
                      onClick={() => setDeleteTarget(entry)}
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

      <EditLineDialog
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleEditSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this line?</AlertDialogTitle>
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
