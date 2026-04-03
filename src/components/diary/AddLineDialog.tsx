import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EMOTION_HINTS } from '@/types/diary';

interface AddLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    line: string;
    emotion: string;
    meaning?: string;
    languageNote?: string;
    moment?: string;
    author?: string;
    sourceType?: 'poem' | 'shayari' | 'song' | 'book' | 'other';
  }) => void;
}

export function AddLineDialog({ isOpen, onClose, onSave }: AddLineDialogProps) {
  const [line, setLine] = useState('');
  const [emotion, setEmotion] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [meaning, setMeaning] = useState('');
  const [languageNote, setLanguageNote] = useState('');
  const [moment, setMoment] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceType, setSourceType] = useState<'poem' | 'shayari' | 'song' | 'book' | 'other' | undefined>();

  const handleSave = () => {
    if (!line.trim() || !emotion.trim()) return;

    onSave({
      line: line.trim(),
      emotion: emotion.trim(),
      meaning: meaning.trim() || undefined,
      languageNote: languageNote.trim() || undefined,
      moment: moment.trim() || undefined,
      author: author.trim() || undefined,
      sourceType,
    });

    // Reset form
    setLine('');
    setEmotion('');
    setMeaning('');
    setLanguageNote('');
    setMoment('');
    setAuthor('');
    setSourceType(undefined);
    setShowOptional(false);
    onClose();
  };

  const handleEmotionSelect = (e: string) => {
    setEmotion(e);
  };

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
              <h2 className="font-serif text-lg text-foreground">Add a line</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Line text - no auto-correction */}
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

              {/* Emotion - free text, hints are optional */}
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

              {/* Optional fields toggle */}
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showOptional ? 'Less options' : 'More options'}
              </button>

              {/* Optional fields */}
              <AnimatePresence>
                {showOptional && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Textarea
                      placeholder="What does it mean to you? (optional)"
                      value={meaning}
                      onChange={(e) => setMeaning(e.target.value)}
                      className="min-h-[60px] resize-none border-border focus:border-primary bg-background"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />

                    <Input
                      placeholder="What's beautiful about the language? (optional)"
                      value={languageNote}
                      onChange={(e) => setLanguageNote(e.target.value)}
                      className="border-border focus:border-primary bg-background"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />

                    <Textarea
                      placeholder="The moment when you found this... (optional)"
                      value={moment}
                      onChange={(e) => setMoment(e.target.value)}
                      className="min-h-[60px] resize-none border-border focus:border-primary bg-background"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />

                    <Input
                      placeholder="Who wrote this? (optional)"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="border-border focus:border-primary bg-background"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Source (optional)</p>
                      <div className="flex flex-wrap gap-2">
                        {(['poem', 'shayari', 'song', 'book', 'other'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSourceType(sourceType === type ? undefined : type)}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-gentle ${
                              sourceType === type
                                ? 'bg-secondary text-secondary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-accent'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
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
