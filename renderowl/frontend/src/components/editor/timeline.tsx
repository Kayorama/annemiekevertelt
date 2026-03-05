'use client';

import { useState, useRef, useCallback } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import { Play, Scissors, Trash2, Copy, GripVertical } from 'lucide-react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  zoom: number;
  onTimeChange: (time: number) => void;
  onZoomChange: (zoom: number) => void;
}

interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
  layer: number;
}

// Mock timeline data
const mockClips: Clip[] = [
  { id: '1', name: 'Intro', startTime: 0, duration: 5, color: 'bg-blue-500', layer: 0 },
  { id: '2', name: 'Main Video', startTime: 5, duration: 60, color: 'bg-green-500', layer: 0 },
  { id: '3', name: 'Transition', startTime: 65, duration: 2, color: 'bg-purple-500', layer: 0 },
  { id: '4', name: 'Outro', startTime: 67, duration: 10, color: 'bg-orange-500', layer: 0 },
  { id: '5', name: 'Music', startTime: 0, duration: 77, color: 'bg-pink-500', layer: 1 },
];

export default function Timeline({
  currentTime,
  duration,
  zoom,
  onTimeChange,
  onZoomChange,
}: TimelineProps) {
  const [clips] = useState<Clip[]>(mockClips);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = 10 * zoom;
  const totalWidth = duration * pixelsPerSecond;

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current || isDragging) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond));
      onTimeChange(newTime);
    },
    [duration, isDragging, onTimeChange, pixelsPerSecond]
  );

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.2, 0.5));
  };

  return (
    <div className="h-48 border-t bg-card flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timeline</span>
          <span className="text-xs text-muted-foreground">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="rounded p-1 hover:bg-muted"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="rounded p-1 hover:bg-muted"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <div
          className="relative min-h-full"
          style={{ width: Math.max(totalWidth, timelineRef.current?.clientWidth || 0) }}
          onClick={handleTimelineClick}
        >
          {/* Time ruler */}
          <div className="sticky top-0 z-10 flex h-6 border-b bg-muted/50">
            {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 border-l text-[10px] text-muted-foreground pl-1"
                style={{ width: 10 * pixelsPerSecond }}
              >
                {formatDuration(i * 10)}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-20 w-px bg-red-500 pointer-events-none"
            style={{ left: currentTime * pixelsPerSecond }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45" />
          </div>

          {/* Track layers */}
          {[0, 1, 2].map((layer) => (
            <div
              key={layer}
              className="relative h-12 border-b hover:bg-muted/30 transition-colors"
              style={{ width: totalWidth }}
            >
              {clips
                .filter((clip) => clip.layer === layer)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className={cn(
                      'absolute top-1 bottom-1 rounded cursor-pointer flex items-center gap-1 px-2 overflow-hidden',
                      clip.color,
                      selectedClipId === clip.id && 'ring-2 ring-white'
                    )}
                    style={{
                      left: clip.startTime * pixelsPerSecond,
                      width: clip.duration * pixelsPerSecond,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(clip.id);
                    }}
                  >
                    <GripVertical className="h-3 w-3 opacity-50" />
                    <span className="text-xs text-white font-medium truncate">
                      {clip.name}
                    </span>
                  </div>
                ))}
            </div>
          ))}

          {/* Empty state for tracks */}
          {clips.length === 0 && (
            <div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
              Drag media here to start editing
            </div>
          )}
        </div>
      </div>

      {/* Selected clip actions */}
      {selectedClipId && (
        <div className="flex items-center gap-2 border-t px-4 py-2 bg-muted/30">
          <button className="flex items-center gap-1 text-xs hover:text-primary">
            <Scissors className="h-3 w-3" />
            Split
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-primary">
            <Copy className="h-3 w-3" />
            Duplicate
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-destructive">
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
