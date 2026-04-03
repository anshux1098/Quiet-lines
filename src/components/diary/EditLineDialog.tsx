import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EMOTION_HINTS } from '@/types/diary';
import type { DiaryEntry } from '@/types/diary';

interface EditLineDialogProps {
  isOpen: boolean;
  entry: DiaryEntry | null;
  onClose: () => void;
  onSave: (id: string, data: { line: string; emotion: string; author: string }) => void;
}

export function EditLineDialog({ isOpen, entry, onClose, onSave }: EditLineDialogProps) {
  const [line, setLine] = useState('');
  const [emotion, setEmotion] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (isOpen && entry) {
      setLine(entry.line);
      setEmotion(entry.emotion);
      setAuthor(entry.author ?? '');
    }
  }, [isOpen, entry]);

  const handleSave = () => {
    if (!entry || !line.trim() || !emotion.trim()) return;
    onSave(entry.id, { line: line.trim(), emotion: emotion.trim(), author: author.trim() });
    onClose();
  };

  const handleEmotionSelect = (e: string) => {
    setEmotion(e);
  };

  return (
    <AnimatePresence>
      {isOpen && entry && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-2xl shadow-lifted z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg text-foreground">Edit line</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Textarea
                  placeholder="The line that moved you..."
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  className="min-h-[100px] font-serif text-lg resize-none border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <Input
                  placeholder="A feeling, in your words..."
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOTION_HINTS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handleEmotionSelect(e)}
                      className={`px-3 py-1 rounded-full text-xs transition-all duration-gentle ${
                        emotion.toLowerCase() === e
                          ? 'bg-primary/80 text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Input
                  placeholder="Who wrote this? (optional)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={!line.trim() || !emotion.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                Save
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
