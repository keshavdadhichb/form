'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import type { Story } from '@/lib/supabase';
import StoryPDF from './StoryPDF';

interface Props { story: Story }

export default function PDFDownloadButton({ story }: Props) {
  const fileName = `${story.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-story.pdf`;

  return (
    <PDFDownloadLink document={<StoryPDF story={story} />} fileName={fileName}>
      {({ loading, error }) => (
        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            bg-terracotta text-terracotta-ink font-sans text-sm font-medium
            hover:bg-[#DFA084] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Preparing PDF…
            </>
          ) : error ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              PDF error — try again
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="18" /><line x1="15" y1="15" x2="12" y2="18" />
              </svg>
              Download story PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
