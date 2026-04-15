'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';

const MAX_DURATION = 5 * 60; // 5 minutes in seconds
const WARNING_AT = 4 * 60 + 30; // 4:30

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioRecorder() {
  const { t } = useTranslation();
  const { audioBlob, setAudioBlob } = useFormStore();

  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 28;
    const barWidth = (canvas.width - barCount * 2) / barCount;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] / 255;
      const barHeight = Math.max(4, value * canvas.height * 0.85);
      const x = i * (barWidth + 2);
      const y = (canvas.height - barHeight) / 2;

      ctx.fillStyle = '#E8B298';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Web Audio analyser
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setState('done');
      };

      recorder.start(100);
      setState('recording');
      setElapsed(0);

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start waveform
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    } catch (err) {
      console.error('Audio recording error:', err);
    }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const reRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setState('idle');
    setElapsed(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const isWarning = elapsed >= WARNING_AT;
  const remaining = MAX_DURATION - elapsed;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Record button */}
            <motion.button
              onClick={startRecording}
              className="w-22 h-22 rounded-full bg-terracotta flex items-center justify-center cursor-pointer shadow-[0_1px_2px_rgba(61,51,48,0.08)]"
              style={{ width: 88, height: 88 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              aria-label={t('story.audio.record')}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="10" y="4" width="8" height="14" rx="4" fill="#4A1B0C" />
                <path d="M5 14C5 19.5228 9.02944 24 14 24C18.9706 24 23 19.5228 23 14" stroke="#4A1B0C" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="24" x2="14" y2="27" stroke="#4A1B0C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.button>
            <p className="text-sm text-ink-hint font-sans">{t('story.audio.record')}</p>
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Waveform canvas */}
            <canvas
              ref={canvasRef}
              width={280}
              height={60}
              className="rounded-xl"
              aria-hidden="true"
            />

            {/* Timer */}
            <motion.p
              className={`font-sans tabular-nums text-xl font-medium ${isWarning ? 'text-rose' : 'text-ink'}`}
              animate={isWarning ? { opacity: [1, 0.5, 1] } : {}}
              transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
            >
              {formatTime(elapsed)}
              {isWarning && (
                <span className="text-sm ml-2 font-normal">{formatTime(remaining)} left</span>
              )}
            </motion.p>

            {/* Stop button */}
            <motion.button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-ink flex items-center justify-center cursor-pointer"
              whileTap={{ scale: 0.95 }}
              aria-label={t('story.audio.stop')}
            >
              <div className="w-5 h-5 rounded-sm bg-paper" />
            </motion.button>
          </motion.div>
        )}

        {state === 'done' && audioUrl && (
          <motion.div
            key="done"
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Playback */}
            <audio
              src={audioUrl}
              controls
              className="w-full max-w-xs rounded-xl"
              aria-label="Your recorded audio"
            />
            <p className="text-sm text-ink-hint font-sans">{formatTime(elapsed)} recorded</p>

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={reRecord}>
                {t('story.audio.rerecord')}
              </Button>
              <Button variant="primary" size="sm" onClick={() => {}}>
                {t('story.audio.keep')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
