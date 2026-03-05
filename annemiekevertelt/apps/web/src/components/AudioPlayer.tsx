import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  audioUrl: string | null;
  coverImage?: string | null;
  duration?: string;
}

export default function AudioPlayer({ title, audioUrl, coverImage, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setTotalDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Cover Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-warm-brown to-gold flex items-center justify-center"
          style={{
            background: coverImage ? undefined : 'linear-gradient(135deg, #8B7355 0%, #C4A77D 100%)'
          }}
        >
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-12 h-12 text-cream" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full">
          <h3 className="font-serif text-xl text-dark-brown mb-1 truncate text-center sm:text-left">{title}</h3>
          
          {duration && (
            <p className="text-sm text-text-muted mb-4 text-center sm:text-left">Duur: {duration}</p>
          )}

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-cream-dark rounded-full appearance-none cursor-pointer accent-warm-brown"
              style={{
                background: `linear-gradient(to right, #8B7355 ${progressPercent}%, #F5ECD8 ${progressPercent}%)`
              }}
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime -= 10;
                }
              }}
              className="p-2 text-warm-brown hover:text-dark-brown transition-colors"
              aria-label="10 seconden terug"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button 
              onClick={togglePlay}
              disabled={!audioUrl}
              className="w-14 h-14 rounded-full bg-warm-brown text-cream flex items-center justify-center hover:bg-dark-brown transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isPlaying ? "Pauze" : "Afspelen"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime += 10;
                }
              }}
              className="p-2 text-warm-brown hover:text-dark-brown transition-colors"
              aria-label="10 seconden vooruit"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={toggleMute}
                className="p-1 text-warm-brown hover:text-dark-brown transition-colors"
                aria-label={isMuted ? "Geluid aan" : "Dempen"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-cream-dark rounded-full appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
