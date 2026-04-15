'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useFormStore } from '@/lib/store';
import Button from '@/components/ui/Button';

const MAX_DURATION = 5 * 60;
const WARNING_AT = 4 * 60 + 30;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoRecorder() {
  const { t } = useTranslation();
  const { videoBlob, setVideoBlob } = useFormStore();

  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play();
      }
      setCameraError(false);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : '';

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoBlob(blob);
      setState('done');
      // Stop camera stream after recording
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };

    recorder.start(100);
    setState('recording');
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= MAX_DURATION - 1) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const reRecord = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoBlob(null);
    setState('idle');
    setElapsed(0);
    startCamera();
  };

  useEffect(() => {
    if (state === 'done' && videoUrl && playbackRef.current) {
      playbackRef.current.src = videoUrl;
    }
  }, [state, videoUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const isWarning = elapsed >= WARNING_AT;

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="text-3xl">📵</span>
        <p className="text-sm text-ink-muted font-sans max-w-xs">
          Camera access is required. Please allow camera permissions and try again.
        </p>
        <Button variant="secondary" size="sm" onClick={startCamera}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <AnimatePresence mode="wait">
        {state !== 'done' && (
          <motion.div
            key="camera"
            className="w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-ink relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
              aria-label="Camera preview"
            />

            {state === 'recording' && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-ink/60 rounded-full px-3 py-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-rose"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className={`text-paper text-sm font-sans tabular-nums ${isWarning ? 'text-rose' : ''}`}>
                  {formatTime(elapsed)}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {state === 'done' && videoUrl && (
          <motion.video
            key="playback"
            ref={playbackRef}
            src={videoUrl}
            controls
            playsInline
            className="w-full max-w-sm rounded-2xl aspect-[4/3] bg-ink object-cover"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            aria-label="Your recorded video"
          />
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {state === 'idle' && (
          <motion.button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-terracotta flex items-center justify-center cursor-pointer shadow-[0_1px_2px_rgba(61,51,48,0.08)]"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            aria-label={t('story.video.record')}
          >
            <div className="w-5 h-5 rounded-full bg-terracotta-ink" />
          </motion.button>
        )}

        {state === 'recording' && (
          <motion.button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-ink flex items-center justify-center cursor-pointer"
            whileTap={{ scale: 0.95 }}
            aria-label={t('story.video.stop')}
          >
            <div className="w-5 h-5 rounded-sm bg-paper" />
          </motion.button>
        )}

        {state === 'done' && (
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={reRecord}>
              {t('story.video.rerecord')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => {}}>
              {t('story.video.keep')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
