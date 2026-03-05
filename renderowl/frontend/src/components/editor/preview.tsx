'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

export default function Preview({
  isPlaying,
  currentTime,
  onTimeUpdate,
}: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulate video playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onTimeUpdate(currentTime + 0.033); // ~30fps
    }, 33);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, onTimeUpdate]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden shadow-2xl',
        isFullscreen ? 'w-full h-full' : 'aspect-video w-full max-w-4xl'
      )}
    >
      {/* Video placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white ml-1" />
            )}
          </div>
          <p className="text-white/60 text-sm">Preview Mode</p>
          <p className="text-white/40 text-xs mt-1">
            Connect video source for live preview
          </p>
        </div>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Safe zones */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-[90%] h-[90%] border border-white" />
        </div>

        {/* Timecode */}
        <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-xs text-white font-mono">
          {Math.floor(currentTime / 60)
            .toString()
            .padStart(2, '0')}
          :{(currentTime % 60).toFixed(2).padStart(5, '0')}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Resolution badge */}
      <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-xs text-white/60">
        1920 × 1080
      </div>
    </div>
  );
}
