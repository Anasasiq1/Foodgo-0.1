import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioDataUrl: string, duration: number) => void;
  onCancel: () => void;
  primaryColor?: string;
  theme?: 'customer' | 'admin';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
  primaryColor = '#EF2A39',
  theme = 'customer',
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('recording');
  const [duration, setDuration] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start recording on mount
  useEffect(() => {
    startRecording();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setPreviewAudioUrl(base64Audio);
          setRecordingState('preview');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(100);
      setRecordingState('recording');

      // Start duration counter
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg(
        err.message?.includes('Permission') || err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access to send voice notes.'
          : 'Unable to start recording. Please check your microphone.'
      );
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleDiscard = () => {
    cleanup();
    setPreviewAudioUrl(null);
    setIsPreviewPlaying(false);
    onCancel();
  };

  const handleSend = () => {
    if (!previewAudioUrl) return;
    const finalDuration = Math.max(1, duration);
    onSendVoice(previewAudioUrl, finalDuration);
    cleanup();
  };

  const togglePreviewPlay = () => {
    if (!previewAudioUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(previewAudioUrl);
      previewAudioRef.current = audio;

      audio.ontimeupdate = () => {
        setPreviewCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setIsPreviewPlaying(false);
        setPreviewCurrentTime(0);
      };
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (errorMsg) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 animate-in fade-in">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="font-semibold leading-tight">{errorMsg}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={startRecording}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Active recording bar
  if (recordingState === 'recording') {
    return (
      <div className="w-full bg-[#322A2E] text-white rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)] animate-in fade-in">
        {/* Pulsing indicator & Timer */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#EF2A39] animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-[#EF2A39] relative" />
          </div>
          <span className="text-xs font-black tracking-wider text-white">
            {formatTime(duration)}
          </span>
          <span className="text-[11px] font-semibold text-gray-300 hidden sm:inline">
            Recording voice message...
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleDiscard}
            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/10"
            title="Cancel & Discard"
            aria-label="Discard recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Stop / Finish recording button */}
          <button
            type="button"
            onClick={stopRecording}
            className="px-3.5 py-1.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs cursor-pointer"
            aria-label="Done recording"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Done</span>
          </button>
        </div>
      </div>
    );
  }

  // Preview before sending
  return (
    <div className="w-full bg-[#F4F5F7] border border-gray-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
      {/* Audio playback controls */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={togglePreviewPlay}
          className="w-8 h-8 rounded-full bg-[#EF2A39] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
          aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
        >
          {isPreviewPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          )}
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#322A2E]">
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#EF2A39]" />
              <span>Voice Note</span>
            </span>
            <span className="text-gray-500 font-semibold">
              {formatTime(isPreviewPlaying ? previewCurrentTime : duration)}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#EF2A39] h-full transition-all duration-100"
              style={{
                width: `${duration > 0 ? (previewCurrentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleDiscard}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 cursor-pointer"
          title="Discard note"
          aria-label="Discard recording"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSend}
          className="px-3.5 py-1.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-[0_4px_12px_rgba(239,42,57,0.3)] cursor-pointer"
          aria-label="Send voice message"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
