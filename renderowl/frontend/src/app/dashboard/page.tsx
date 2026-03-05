'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Grid, List, Filter, MoreVertical, Clock, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { OnboardingFlow, useOnboarding } from '@/components/onboarding-flow';
import { KeyboardShortcutsPanel, useKeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { EmptyProjects, EmptySearch } from '@/components/empty-state';
import { DashboardSkeleton, ProjectCardSkeleton } from '@/components/ui/skeleton';
import { toastSuccess, toastInfo } from '@/hooks/use-toast';
import { cn, formatDuration, generateId } from '@/lib/utils';
import type { Project } from '@/types';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Product Demo Video',
    description: 'Q1 product showcase',
    duration: 125.5,
    width: 1920,
    height: 1080,
    fps: 30,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-04T15:30:00Z',
    userId: 'user-1',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Social Media Promo',
    description: 'Instagram and TikTok',
    duration: 45.2,
    width: 1080,
    height: 1920,
    fps: 30,
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-04T12:00:00Z',
    userId: 'user-1',
    status: 'draft',
  },
  {
    id: '3',
    name: 'YouTube Tutorial',
    description: 'Getting started guide',
    duration: 320.0,
    width: 1920,
    height: 1080,
    fps: 60,
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-03-02T16:00:00Z',
    userId: 'user-1',
    status: 'rendering',
    progress: 65,
  },
];

function ProjectCard({ project }: { project: Project }) {
  const aspectRatio = project.width / project.height;
  const isVertical = aspectRatio < 1;

  return (
    <Link href={`/editor/${project.id}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md hover:border-primary/50">
        {/* Thumbnail */}
        <div className={cn(
          'relative bg-muted flex items-center justify-center',
          isVertical ? 'aspect-[9/16]' : 'aspect-video'
        )}>
          {project.status === 'rendering' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="mt-2 text-xs font-medium">{project.progress}%</span>
            </div>
          ) : (
            <>
              <Film className="h-12 w-12 text-muted-foreground/30" />
              <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                {formatDuration(project.duration)}
              </div>
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="truncate font-medium">{project.name}</h3>
          {project.description && (
            <p className="truncate text-xs text-muted-foreground">{project.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <button
          className="absolute right-2 top-2 rounded bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { showOnboarding, setShowOnboarding } = useOnboarding();
  const { isOpen: shortcutsOpen, open: openShortcuts, close: closeShortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    // Simulate loading projects
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: 'Untitled Project',
      duration: 0,
      width: 1920,
      height: 1080,
      fps: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1',
      status: 'draft',
    };
    setProjects([newProject, ...projects]);
    toastSuccess('Project created', 'Your new project is ready to edit');
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">RenderOwl</span>
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-l-lg transition-colors',
                  viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-r-lg transition-colors',
                  viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          searchQuery ? (
            <EmptySearch onClear={() => setSearchQuery('')} />
          ) : (
            <EmptyProjects onCreate={handleCreateProject} />
          )
        ) : (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <button
          onClick={openShortcuts}
          className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs text-muted-foreground shadow-sm hover:text-foreground transition-colors"
        >
          Press <kbd className="rounded bg-muted px-1.5 font-mono">?</kbd> for shortcuts
        </button>
      </div>

      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => toastInfo('Welcome aboard!', 'You\'re ready to start creating')}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel isOpen={shortcutsOpen} onClose={closeShortcuts} />
    </div>
  );
}
