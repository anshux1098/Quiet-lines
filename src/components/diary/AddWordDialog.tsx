import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EMOTION_HINTS } from '@/types/diary';

interface AddWordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    word: string;
    meaning: string;
    sentence: string;
    emotion: string;
  }) => void;
}

export function AddWordDialog({ isOpen, onClose, onSave }: AddWordDialogProps) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [sentence, setSentence] = useState('');
  const [emotion, setEmotion] = useState('');

  const handleSave = () => {
    if (!word.trim() || !meaning.trim() || !sentence.trim() || !emotion.trim()) return;

    onSave({
      word: word.trim(),
      meaning: meaning.trim(),
      sentence: sentence.trim(),
      emotion: emotion.trim(),
    });

    // Reset form
    setWord('');
    setMeaning('');
    setSentence('');
    setEmotion('');
    onClose();
  };

  const handleEmotionSelect = (e: string) => {
    setEmotion(e);
  };

  const isValid = word.trim() && meaning.trim() && sentence.trim() && emotion.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-2xl shadow-lifted z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg text-foreground">A word I like</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form - no auto-correction anywhere */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Word */}
              <div>
                <Input
                  placeholder="The word..."
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="font-serif text-xl border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              {/* Meaning - allowed to be rough */}
              <div>
                <Textarea
                  placeholder="What it means to you..."
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  className="min-h-[80px] resize-none border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              {/* Sentence - can be incomplete */}
              <div>
                <Textarea
                  placeholder="Use it in a sentence..."
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  className="min-h-[80px] font-serif italic resize-none border-border focus:border-primary bg-background"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              {/* Emotion - free text with gentle hints */}
              <div>
                <Input
                  placeholder="The vibe..."
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
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={!isValid}
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
