'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Type,
  Image,
  Music,
  Wand2,
  Download,
  Undo,
  Redo,
  Settings,
  Save,
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { toastSuccess, toastError } from '@/hooks/use-toast';
import { cn, formatDuration } from '@/lib/utils';

// Lazy load heavy editor components
const Timeline = lazy(() => import('@/components/editor/timeline'));
const Preview = lazy(() => import('@/components/editor/preview'));
const PropertiesPanel = lazy(() => import('@/components/editor/properties-panel'));
const MediaLibrary = lazy(() => import('@/components/editor/media-library'));

// Fallback components for suspense
function TimelineFallback() {
  return (
    <div className="h-48 border-t bg-muted/50 p-4">
      <div className="h-full animate-pulse rounded bg-muted" />
    </div>
  );
}

function PreviewFallback() {
  return (
    <div className="aspect-video w-full max-w-4xl animate-pulse rounded-lg bg-muted" />
  );
}

interface EditorState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipId: string | null;
}

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [state, setState] = useState<EditorState>({
    isPlaying: false,
    currentTime: 0,
    duration: 125.5,
    zoom: 1,
    selectedClipId: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'media' | 'text' | 'effects'>('media');

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!silent) {
        toastSuccess('Project saved', 'All changes have been saved');
      }
    } catch {
      toastError('Save failed', 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPause = () => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleExport = () => {
    toastSuccess('Export started', 'Your video is being rendered');
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Toolbar */}
      <header className="flex h-14 items-center gap-4 border-b px-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <span className="font-medium">Untitled Project</span>
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => toastInfo('Undo', 'Action undone')}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toastInfo('Redo', 'Action redone')}>
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Save status */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="hidden sm:flex gap-2"
        >
          <Save className={cn('h-4 w-4', isSaving && 'animate-pulse')} />
          {isSaving ? 'Saving...' : 'Saved'}
        </Button>

        <ThemeToggle />

        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </header>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <aside className="flex w-16 flex-col border-r bg-muted/30">
          <button
            onClick={() => setSidebarTab('media')}
            className={cn(
              'flex flex-col items-center gap-1 p-3 transition-colors',
              sidebarTab === 'media' && 'bg-primary/10 text-primary'
            )}
          >
            <Image className="h-5 w-5" />
            <span className="text-[10px]">Media</span>
          </button>
          <button
            onClick={() => setSidebarTab('text')}
            className={cn(
              'flex flex-col items-center gap-1 p-3 transition-colors',
              sidebarTab === 'text' && 'bg-primary/10 text-primary'
            )}
          >
            <Type className="h-5 w-5" />
            <span className="text-[10px]">Text</span>
          </button>
          <button
            onClick={() => setSidebarTab('effects')}
            className={cn(
              'flex flex-col items-center gap-1 p-3 transition-colors',
              sidebarTab === 'effects' && 'bg-primary/10 text-primary'
            )}
          >
            <Wand2 className="h-5 w-5" />
            <span className="text-[10px]">Effects</span>
          </button>

          <div className="flex-1" />

          <button className="flex flex-col items-center gap-1 p-3 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </aside>

        {/* Media Panel */}
        <aside className="w-64 border-r bg-muted/30 hidden lg:block">
          <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}>
            <MediaLibrary activeTab={sidebarTab} />
          </Suspense>
        </aside>

        {/* Center - Preview */}
        <main className="flex flex-1 flex-col bg-muted/50">
          <div className="flex flex-1 items-center justify-center p-8">
            <Suspense fallback={<PreviewFallback />}>
              <Preview
                isPlaying={state.isPlaying}
                currentTime={state.currentTime}
                onTimeUpdate={(time) =>
                  setState((prev) => ({ ...prev, currentTime: time }))
                }
              />
            </Suspense>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 border-t bg-background p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setState((prev) => ({ ...prev, currentTime: 0 }))
              }
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10"
              onClick={handlePlayPause}
            >
              {state.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setState((prev) => ({ ...prev, currentTime: prev.duration }))
              }
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="ml-4 font-mono text-sm">
              {formatDuration(state.currentTime)} / {formatDuration(state.duration)}
            </div>
          </div>

          {/* Timeline */}
          <Suspense fallback={<TimelineFallback />}>
            <Timeline
              currentTime={state.currentTime}
              duration={state.duration}
              zoom={state.zoom}
              onTimeChange={(time) =>
                setState((prev) => ({ ...prev, currentTime: time }))
              }
              onZoomChange={(zoom) =>
                setState((prev) => ({ ...prev, zoom }))
              }
            />
          </Suspense>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-72 border-l bg-muted/30 hidden xl:block">
          <Suspense
            fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}
          >
            <PropertiesPanel />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
