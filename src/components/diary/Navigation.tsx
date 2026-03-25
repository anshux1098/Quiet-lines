import { motion } from 'framer-motion';
import { Home, BookOpen, Heart, Moon, Download, Upload } from 'lucide-react';

type View = 'home' | 'browse' | 'words' | 'silent';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onExport: () => void;
  onImport: () => void;
}

export function Navigation({ currentView, onNavigate, onExport, onImport }: NavigationProps) {
  const navItems = [
    { id: 'home' as View, icon: Home, label: 'Home' },
    { id: 'browse' as View, icon: BookOpen, label: 'Browse' },
    { id: 'words' as View, icon: Heart, label: 'Words' },
    { id: 'silent' as View, icon: Moon, label: 'Silent' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border px-4 py-2 z-30"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-gentle ${
              currentView === item.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
            {currentView === item.id && (
              <motion.div
                layoutId="navIndicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
        
        <button
          onClick={onImport}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-gentle"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">Restore</span>
        </button>
        
        <button
          onClick={onExport}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-gentle"
        >
          <Download className="w-5 h-5" />
          <span className="text-xs">Export</span>
        </button>
      </div>
    </motion.nav>
  );
}
