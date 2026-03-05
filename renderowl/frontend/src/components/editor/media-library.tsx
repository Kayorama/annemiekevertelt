'use client';

import { useState } from 'react';
import { Image, Music, Video, Upload, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyUploads } from '@/components/empty-state';

interface MediaLibraryProps {
  activeTab: 'media' | 'text' | 'effects';
}

interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  thumbnail?: string;
  duration?: number;
}

// Mock media data
const mockMedia: MediaItem[] = [
  { id: '1', name: 'Intro.mp4', type: 'video', duration: 5 },
  { id: '2', name: 'Main footage.mp4', type: 'video', duration: 60 },
  { id: '3', name: 'Logo.png', type: 'image' },
  { id: '4', name: 'Background.mp3', type: 'audio', duration: 180 },
];

const textTemplates = [
  { id: '1', name: 'Title', preview: 'Aa' },
  { id: '2', name: 'Subtitle', preview: 'Aa' },
  { id: '3', name: 'Lower Third', preview: 'Aa' },
];

const effects = [
  { id: '1', name: 'Fade In', category: 'Transition' },
  { id: '2', name: 'Fade Out', category: 'Transition' },
  { id: '3', name: 'Blur', category: 'Filter' },
  { id: '4', name: 'B&W', category: 'Filter' },
];

export default function MediaLibrary({ activeTab }: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (activeTab === 'media') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-3">Media Library</h3>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm hover:bg-muted transition-colors">
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm hover:bg-muted transition-colors">
              <Folder className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>

        <div className="p-2 border-b">
          <div className="flex gap-1">
            {['all', 'video', 'image', 'audio'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-1 rounded px-2 py-1 text-xs capitalize transition-colors',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {mockMedia.length === 0 ? (
            <EmptyUploads onUpload={() => {}} />
          ) : (
            <div className="space-y-2">
              {mockMedia
                .filter(
                  (item) =>
                    selectedCategory === 'all' || item.type === selectedCategory
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      {item.type === 'video' && <Video className="h-5 w-5" />}
                      {item.type === 'image' && <Image className="h-5 w-5" />}
                      {item.type === 'audio' && <Music className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.duration && (
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(item.duration / 60)}:
                          {(item.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'text') {
    return (
      <div className="h-full flex flex-col p-4">
        <h3 className="font-medium mb-4">Text Templates</h3>
        <div className="space-y-2">
          {textTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted cursor-pointer transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-lg font-bold">
                {template.preview}
              </div>
              <span className="text-sm font-medium">{template.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Effects tab
  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="font-medium mb-4">Effects</h3>
      <div className="space-y-4">
        {['Transition', 'Filter'].map((category) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {effects
                .filter((e) => e.category === category)
                .map((effect) => (
                  <button
                    key={effect.id}
                    className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors"
                  >
                    {effect.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
