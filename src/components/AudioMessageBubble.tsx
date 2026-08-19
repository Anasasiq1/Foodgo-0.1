import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessageBubbleProps {
  audioUrl?: string;
  duration?: number;
  isSender: boolean;
  theme?: 'user' | 'agent' | 'admin-customer';
}

export const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  audioUrl,
  duration = 0,
  isSender,
  theme = 'user',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * totalDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Waveform mock bars
  const bars = [35, 60, 40, 85, 55, 95, 70, 45, 80, 60, 40, 75, 90, 50, 65, 40];

  const isUserTheme = theme === 'user';
  const isAdminAgentTheme = theme === 'agent';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl min-w-[210px] max-w-[290px] select-none ${
        isUserTheme
          ? 'bg-[#EF2A39] text-white shadow-[0_4px_14px_rgba(239,42,57,0.25)]'
          : isAdminAgentTheme
          ? 'bg-[#322A2E] text-white'
          : 'bg-[#F4F5F7] text-[#322A2E] border border-gray-200/80'
      }`}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          isUserTheme
            ? 'bg-white text-[#EF2A39] shadow-xs'
            : isAdminAgentTheme
            ? 'bg-white text-[#322A2E] shadow-xs'
            : 'bg-[#EF2A39] text-white shadow-xs'
        }`}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Waveform & Timeline */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          onClick={handleSeek}
          className="flex items-center gap-[2.5px] h-6 cursor-pointer"
          title="Click to seek"
        >
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isFilled = barProgress <= progressPercent;

            return (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`flex-1 rounded-full transition-all duration-100 ${
                  isUserTheme
                    ? isFilled
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isAdminAgentTheme
                    ? isFilled
                      ? 'bg-white'
                      : 'bg-white/30'
                    : isFilled
                    ? 'bg-[#EF2A39]'
                    : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-[10px] font-bold tracking-tight opacity-90">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}</span>
          <span className="flex items-center gap-1 opacity-75">
            <Volume2 className="w-3 h-3" />
            <span>Voice</span>
          </span>
        </div>
      </div>
    </div>
  );
};
