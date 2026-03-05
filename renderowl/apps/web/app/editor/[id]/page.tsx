'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, SkipBack, SkipForward, Scissors, Type, Image as ImageIcon, Music, Download, Upload, Film, ArrowLeft } from 'lucide-react';

interface Clip {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio';
  name: string;
  startTime: number;
  duration: number;
  src?: string;
  content?: string;
}

interface Timeline {
  id: string;
  name: string;
  duration: number;
  clips: Clip[];
}

export default function EditorPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const router = useRouter();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setTimeline({
        id: 'new',
        name: 'Untitled Project',
        duration: 30,
        clips: [],
      });
      setIsLoading(false);
    } else if (userId) {
      fetchTimeline();
    }
  }, [id, userId]);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/timeline/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClip = useCallback((type: Clip['type']) => {
    if (!timeline) return;

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      type,
      name: `New ${type}`,
      startTime: currentTime,
      duration: 5,
    };

    setTimeline({
      ...timeline,
      clips: [...timeline.clips, newClip],
    });
  }, [timeline, currentTime]);

  const handleExport = async (quality: string) => {
    try {
      const response = await fetch(`/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timelineId: id, quality }),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to start render:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={timeline?.name || ''}
              onChange={(e) => timeline && setTimeline({ ...timeline, name: e.target.value })}
              className="bg-transparent text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddClip('video')}
              data-testid="add-media-button"
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
            >
              <Film className="w-4 h-4" />
              Add Video
            </button>

            <button
              onClick={() => handleAddClip('text')}
              data-testid="add-text-button"
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              data-testid="export-button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div data-testid="preview-container" className="flex-1 bg-black flex items-center justify-center relative">
            {timeline?.clips.length === 0 ? (
              <div className="text-center">
                <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Add clips to start editing</p>
              </div>
            ) : (
              <div className="relative w-full h-full max-w-4xl max-h-[80%] mx-auto">
                <div className="absolute inset-0 bg-gray-800 rounded-lg overflow-hidden">
                  {timeline.clips.map((clip) => (
                    <div
                      key={clip.id}
                      data-testid="canvas-clip"
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ opacity: clip.startTime <= currentTime && currentTime <= clip.startTime + clip.duration ? 1 : 0 }}
                    >
                      {clip.type === 'text' ? (
                        <span data-testid="canvas-text-overlay" className="text-4xl font-bold text-white">
                          {clip.content || clip.name}
                        </span>
                      ) : (
                        <Film className="w-24 h-24 text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <SkipBack className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                data-testid={isPlaying ? 'pause-button' : 'play-button'}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => setCurrentTime(Math.min(timeline?.duration || 30, currentTime + 10))}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <SkipForward className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <span className="text-sm text-gray-400 w-12 text-right">
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </span>

              <input
                type="range"
                min="0"
                max={timeline?.duration || 30}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />

              <span className="text-sm text-gray-400 w-12">
                {Math.floor((timeline?.duration || 30) / 60)}:{String(Math.floor((timeline?.duration || 30) % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div data-testid="timeline-container" className="bg-gray-800 border-t border-gray-700 h-48 overflow-x-auto">
        <div data-testid="timeline-editor" className="min-w-full p-4">
          <div data-testid="timeline-track" className="timeline-track relative h-24">
            {timeline?.clips.map((clip, index) => (
              <div
                key={clip.id}
                data-testid="timeline-clip"
                data-clip-index={index}
                onClick={() => setSelectedClip(clip.id)}
                className={`timeline-clip ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                style={{
                  left: `${(clip.startTime / (timeline.duration || 30)) * 100}%`,
                  width: `${(clip.duration / (timeline.duration || 30)) * 100}%`,
                }}
              >
                <span className="truncate">{clip.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div data-testid="export-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Export Video</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
              <select
                data-testid="quality-select"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="720p">720p</option>
                <option value="1080p" selected>1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleExport('1080p');
                  setShowExportModal(false);
                }}
                data-testid="start-render-button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Render
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
