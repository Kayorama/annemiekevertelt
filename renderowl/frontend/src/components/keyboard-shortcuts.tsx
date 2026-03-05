'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Shortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  scope?: 'global' | 'editor' | 'timeline';
}

const shortcuts: Shortcut[] = [
  // Global shortcuts
  { id: 'new-project', keys: ['Ctrl', 'N'], description: 'Create new project', category: 'General', scope: 'global' },
  { id: 'open-project', keys: ['Ctrl', 'O'], description: 'Open project', category: 'General', scope: 'global' },
  { id: 'save', keys: ['Ctrl', 'S'], description: 'Save project', category: 'General', scope: 'global' },
  { id: 'undo', keys: ['Ctrl', 'Z'], description: 'Undo', category: 'General', scope: 'global' },
  { id: 'redo', keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', category: 'General', scope: 'global' },
  { id: 'search', keys: ['Ctrl', 'K'], description: 'Quick search', category: 'General', scope: 'global' },
  { id: 'shortcuts', keys: ['?'], description: 'Show keyboard shortcuts', category: 'General', scope: 'global' },

  // Editor shortcuts
  { id: 'play-pause', keys: ['Space'], description: 'Play/Pause preview', category: 'Playback', scope: 'editor' },
  { id: 'prev-frame', keys: ['←'], description: 'Previous frame', category: 'Playback', scope: 'editor' },
  { id: 'next-frame', keys: ['→'], description: 'Next frame', category: 'Playback', scope: 'editor' },
  { id: 'start', keys: ['Home'], description: 'Go to start', category: 'Playback', scope: 'editor' },
  { id: 'end', keys: ['End'], description: 'Go to end', category: 'Playback', scope: 'editor' },

  // Timeline shortcuts
  { id: 'split', keys: ['S'], description: 'Split clip at playhead', category: 'Timeline', scope: 'timeline' },
  { id: 'delete', keys: ['Delete', 'Backspace'], description: 'Delete selected clip', category: 'Timeline', scope: 'timeline' },
  { id: 'duplicate', keys: ['Ctrl', 'D'], description: 'Duplicate clip', category: 'Timeline', scope: 'timeline' },
  { id: 'select-all', keys: ['Ctrl', 'A'], description: 'Select all clips', category: 'Timeline', scope: 'timeline' },
  { id: 'deselect', keys: ['Escape'], description: 'Deselect all', category: 'Timeline', scope: 'timeline' },
  { id: 'zoom-in', keys: ['Ctrl', '+'], description: 'Zoom in', category: 'Timeline', scope: 'timeline' },
  { id: 'zoom-out', keys: ['Ctrl', '-'], description: 'Zoom out', category: 'Timeline', scope: 'timeline' },
  { id: 'fit', keys: ['Ctrl', '0'], description: 'Fit to screen', category: 'Timeline', scope: 'timeline' },
];

const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

function KeyBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 font-mono text-xs font-medium',
        className
      )}
    >
      {children}
    </kbd>
  );
}

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    const matchesSearch =
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || shortcut.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setActiveCategory('All')}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              activeCategory === 'All'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h4>
              <div className="space-y-2">
                {items.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <span key={key} className="flex items-center">
                          <KeyBadge>{key}</KeyBadge>
                          {index < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No shortcuts found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p>
            <Command className="inline h-3 w-3 mr-1" />
            Tip: Press <KeyBadge className="mx-1">?</KeyBadge> anywhere to quickly open this panel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Toggle shortcuts panel with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

// Floating shortcut button for mobile/tablet
export function KeyboardShortcutsButton() {
  const { open } = useKeyboardShortcuts();

  return (
    <button
      onClick={open}
      className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors md:hidden"
      aria-label="Keyboard shortcuts"
    >
      <Keyboard className="h-5 w-5" />
    </button>
  );
}
