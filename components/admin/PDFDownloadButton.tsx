'use client';

import { usePDF } from '@react-pdf/renderer';
import type { Story } from '@/lib/supabase';
import StoryPDF from './StoryPDF';

interface Props {
  story: Story;
  /** Compact icon-only button for use in the modal header */
  iconOnly?: boolean;
}

function DownloadButton({ story, iconOnly }: Props) {
  const fileName = `${story.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-story.pdf`;
  const [instance] = usePDF({ document: <StoryPDF story={story} /> });

  const handleDownload = () => {
    if (!instance.url) return;
    const a = document.createElement('a');
    a.href = instance.url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const loading = instance.loading;
  const hasError = !!instance.error;

  if (iconOnly) {
    return (
      <button
        onClick={handleDownload}
        disabled={loading || hasError}
        title="Download story as PDF"
        className="w-8 h-8 rounded-full border border-border-soft flex items-center justify-center
          text-ink-muted hover:text-terracotta hover:border-terracotta/40
          transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading || hasError}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
        bg-terracotta text-terracotta-ink font-sans text-sm font-medium
        hover:bg-[#DFA084] transition-colors cursor-pointer disabled:opacity-60"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preparing PDF…
        </>
      ) : hasError ? (
        'PDF error — try again'
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
          Download story PDF
        </>
      )}
    </button>
  );
}

export default DownloadButton;
