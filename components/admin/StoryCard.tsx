'use client';

import { motion } from 'framer-motion';
import type { Story } from '@/lib/supabase';

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 70%)`;
}

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getBirthYear(dob: string | null): string {
  if (!dob) return '';
  const year = dob.split('-')[0];
  return year || '';
}

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  onToggleHide: () => void;
  token: string;
}

const TYPE_ICONS: Record<string, string> = {
  text: '✍️',
  audio: '🎤',
  video: '🎥',
  upload: '📁',
};

export default function StoryCard({ story, onClick, onToggleHide }: StoryCardProps) {
  const avatarColor = nameToColor(story.name);
  const initials = nameInitials(story.name);
  const birthYear = getBirthYear(story.dob);

  return (
    <motion.div
      className={[
        'bg-paper border rounded-3xl overflow-hidden cursor-pointer',
        'shadow-[0_1px_2px_rgba(61,51,48,0.04)]',
        'hover:border-ink-muted transition-colors',
        story.hidden ? 'border-border-soft opacity-60' : 'border-border-soft',
      ].join(' ')}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      layout
    >
      {/* Card header — clickable */}
      <div className="p-4" onClick={onClick}>
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-medium text-sm"
            style={{ background: story.photo_url ? 'transparent' : avatarColor }}
          >
            {story.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.photo_url} alt={story.name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: '#3D3330' }}>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink font-sans truncate">{story.name}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {birthYear && (
                <span className="text-xs text-ink-hint font-sans">{birthYear}</span>
              )}
              <span className="text-xs font-sans px-1.5 py-0.5 rounded-full bg-wheat text-wheat-ink">
                {story.language === 'hi' ? 'हिन्दी' : 'EN'}
              </span>
              <span className="text-xs font-sans" title={story.story_type}>
                {TYPE_ICONS[story.story_type]}
              </span>
            </div>
          </div>
        </div>

        {/* Story preview */}
        {story.story_text && (
          <div className="relative">
            <p className="text-sm text-ink-muted font-sans leading-relaxed line-clamp-2">
              {story.story_text}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-paper to-transparent" />
          </div>
        )}

        <p className="text-xs text-ink-hint font-sans mt-2">
          {formatDate(story.created_at)}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 border-t border-border-soft pt-2 flex items-center justify-between">
        <span className="text-xs text-ink-hint font-sans capitalize">{story.story_type}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleHide(); }}
          className={[
            'text-xs font-sans cursor-pointer px-2 py-1 rounded-lg transition-colors',
            story.hidden
              ? 'text-sage-ink bg-sage/20 hover:bg-sage/30'
              : 'text-ink-muted hover:text-ink',
          ].join(' ')}
        >
          {story.hidden ? 'Show' : 'Hide'}
        </button>
      </div>
    </motion.div>
  );
}
