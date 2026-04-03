import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDiary } from '@/hooks/useDiary';
import { HomeView } from '@/components/diary/HomeView';
import { BrowseView } from '@/components/diary/BrowseView';
import { WordsView } from '@/components/diary/WordsView';
import { SilentMode } from '@/components/diary/SilentMode';
import { Navigation } from '@/components/diary/Navigation';
import { AddLineDialog } from '@/components/diary/AddLineDialog';
import { AddWordDialog } from '@/components/diary/AddWordDialog';
import { ImportDialog } from '@/components/diary/ImportDialog';
import { AuthPage } from '@/components/diary/AuthPage';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type View = 'home' | 'browse' | 'words' | 'silent';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [showAddLine, setShowAddLine] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const {
    entries,
    words,
    isLoading,
    userId,
    addEntry,
    addWord,
    updateEntry,
    updateWord,
    deleteEntry,
    deleteWord,
    exportData,
    importData,
  } = useDiary();

  // Not logged in — show auth
  if (!userId && !isLoading) {
    return <AuthPage />;
  }

  // Still checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-serif">Loading...</p>
      </div>
    );
  }

  const handleAddLine = (data: {
    line: string;
    emotion: string;
    meaning?: string;
    languageNote?: string;
    moment?: string;
    author?: string;
    sourceType?: 'poem' | 'shayari' | 'song' | 'book' | 'other';
  }) => {
    addEntry(data);
    toast('Line saved', { description: 'Your line has been added to your diary' });
  };

  const handleAddWord = (data: {
    word: string;
    meaning: string;
    sentence: string;
    emotion: string;
  }) => {
    addWord(data);
    toast('Word saved', { description: 'Your word has been added to your collection' });
  };

  const handleExport = () => {
    exportData();
    toast('Exported', { description: 'Your diary has been downloaded' });
  };

  const handleImport = (jsonData: string) => {
    const result = importData(jsonData);
    if ((result as any)?.success) {
      toast('Restored', { description: 'Your diary has been restored' });
    }
    return result as any;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast('Signed out');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sign out button — top right, subtle */}
      {currentView !== 'silent' && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-4 z-50 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          sign out
        </button>
      )}

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <HomeView
            key="home"
            entries={entries}
            onAddClick={() => setShowAddLine(true)}
          />
        )}

        {currentView === 'browse' && (
          <BrowseView
            key="browse"
            entries={entries}
            deleteEntry={deleteEntry}
            updateEntry={updateEntry}
          />
        )}

        {currentView === 'words' && (
          <WordsView
            key="words"
            words={words}
            onAddClick={() => setShowAddWord(true)}
            deleteWord={deleteWord}
            updateWord={updateWord}
          />
        )}

        {currentView === 'silent' && (
          <SilentMode
            key="silent"
            entries={entries}
            onExit={() => setCurrentView('home')}
          />
        )}
      </AnimatePresence>

      {currentView !== 'silent' && (
        <Navigation
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onExport={handleExport}
          onImport={() => setShowImport(true)}
          entryCount={entries.length}
          wordCount={words.length}
        />
      )}

      <AddLineDialog
        isOpen={showAddLine}
        onClose={() => setShowAddLine(false)}
        onSave={handleAddLine}
      />

      <AddWordDialog
        isOpen={showAddWord}
        onClose={() => setShowAddWord(false)}
        onSave={handleAddWord}
      />

      <ImportDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onConfirm={handleImport}
      />
    </div>
  );
};

export default Index;
