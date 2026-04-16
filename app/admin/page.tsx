'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Story } from '@/lib/supabase';
import StoryCard from '@/components/admin/StoryCard';
import StoryModal from '@/components/admin/StoryModal';

type SortOrder = 'newest' | 'oldest' | 'az';
type TypeFilter = 'all' | 'text' | 'audio' | 'video' | 'upload';
type LangFilter = 'all' | 'hi' | 'en';

const COOKIE_KEY = 'pariwar_admin_token';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setToken(token: string) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Strict`;
}

export default function AdminPage() {
  const [token, setTokenState] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getToken();
    if (saved) setTokenState(saved);
  }, []);

  const fetchStories = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stories', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setTokenState(null);
          setAuthError('Wrong password');
        }
        return;
      }
      const data = await res.json();
      setStories(data.stories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchStories(token);
  }, [token, fetchStories]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = passwordInput.trim();
    if (!tok) return;
    // Test the token
    const res = await fetch('/api/admin/stories', {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!res.ok) {
      setAuthError('Wrong password');
      return;
    }
    setToken(tok);
    setTokenState(tok);
    setAuthError('');
    const data = await res.json();
    setStories(data.stories ?? []);
  };

  const handleStoryUpdate = (id: string, updates: Partial<Story>) => {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    setSelectedStory((prev) => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  const exportCSV = () => {
    const cols = ['name', 'phone', 'dob', 'father_name', 'mother_name', 'qualifications', 'achievements', 'hobbies', 'story_type', 'story_text', 'language', 'hidden', 'created_at'];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = [
      cols.join(','),
      ...filtered.map((s) => cols.map((c) => escape(s[c as keyof Story])).join(',')),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pariwar-stories-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleHide = async (story: Story) => {
    if (!token) return;
    const newHidden = !story.hidden;
    // Optimistic update
    setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, hidden: newHidden } : s));
    await fetch(`/api/admin/stories/${story.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hidden: newHidden }),
    });
  };

  const deleteStory = async (story: Story) => {
    if (!token) return;
    // Optimistic removal
    setStories((prev) => prev.filter((s) => s.id !== story.id));
    // Close modal if this story was open
    if (selectedStory?.id === story.id) setSelectedStory(null);
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Rollback on failure
        fetchStories(token);
      }
    } catch {
      fetchStories(token);
    }
  };

  const filtered = useMemo(() => {
    let result = [...stories];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (typeFilter !== 'all') result = result.filter((s) => s.story_type === typeFilter);
    if (langFilter !== 'all') result = result.filter((s) => s.language === langFilter);

    if (sort === 'newest') result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (sort === 'oldest') result.sort((a, b) => a.created_at.localeCompare(b.created_at));
    else result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [stories, search, typeFilter, langFilter, sort]);

  if (!mounted) return null;

  // Auth gate
  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-paper border border-border-soft rounded-3xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center mx-auto mb-4">
              <span className="text-terracotta-ink text-xl" style={{ fontFamily: 'var(--font-tiro-devanagari)' }}>॥</span>
            </div>
            <h1 className="text-xl text-ink font-sans font-medium">परिवार कहानियाँ</h1>
            <p className="text-sm text-ink-hint font-sans mt-1">Admin Access</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 text-base bg-paper border border-border-soft rounded-xl
                text-ink focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 ring-fade
                transition-colors font-sans min-h-[52px]"
              autoFocus
            />
            {authError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-rose font-sans"
              >
                {authError}
              </motion.p>
            )}
            <button
              type="submit"
              className="w-full bg-terracotta text-terracotta-ink rounded-full px-6 py-3
                font-sans font-medium cursor-pointer hover:bg-[#DFA084] transition-colors min-h-[52px]"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium text-ink font-sans">परिवार कहानियाँ</h1>
            <p className="text-xs text-ink-hint font-sans">{filtered.length} / {stories.length} entries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="text-sm text-ink-muted hover:text-ink font-sans cursor-pointer transition-colors no-print"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="text-sm text-ink-muted hover:text-ink font-sans cursor-pointer transition-colors no-print"
            >
              Print view
            </button>
            <button
              onClick={() => { setTokenState(null); }}
              className="text-sm text-ink-hint hover:text-ink font-sans cursor-pointer transition-colors no-print"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 no-print">
        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full sm:max-w-xs px-4 py-2.5 text-base bg-paper border border-border-soft rounded-xl
            text-ink focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 ring-fade
            transition-colors font-sans"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="px-3 py-2 text-sm bg-paper border border-border-soft rounded-xl text-ink font-sans cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A-Z</option>
          </select>

          {/* Type chips */}
          {(['all', 'text', 'audio', 'video', 'upload'] as TypeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={[
                'text-xs font-sans px-3 py-1.5 rounded-full border transition-colors cursor-pointer',
                typeFilter === f
                  ? 'bg-terracotta border-terracotta text-terracotta-ink'
                  : 'bg-paper border-border-soft text-ink-muted hover:border-ink-muted',
              ].join(' ')}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          {/* Lang chips */}
          {(['all', 'hi', 'en'] as LangFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setLangFilter(f)}
              className={[
                'text-xs font-sans px-3 py-1.5 rounded-full border transition-colors cursor-pointer',
                langFilter === f
                  ? 'bg-wheat border-wheat text-wheat-ink'
                  : 'bg-paper border-border-soft text-ink-muted hover:border-ink-muted',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : f === 'hi' ? 'हिन्दी' : 'EN'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-3xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-hint font-sans">No entries found</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            layout
          >
            <AnimatePresence>
              {filtered.map((story) => (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <StoryCard
                    story={story}
                    onClick={() => setSelectedStory(story)}
                    onToggleHide={() => toggleHide(story)}
                    onDelete={() => deleteStory(story)}
                    token={token}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Print view */}
      <div className="hidden print:block">
        {stories.filter((s) => !s.hidden).map((story) => (
          <div key={story.id} className="print-page-break p-8">
            <div className="flex items-start gap-6 mb-6">
              {story.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={story.photo_url} alt={story.name} className="w-24 h-24 rounded-full object-cover" />
              )}
              <div>
                <h2 className="text-2xl font-medium">{story.name}</h2>
                {story.dob && <p className="text-sm mt-1">Born: {story.dob}</p>}
                {story.father_name && <p className="text-sm">Father: {story.father_name}</p>}
                {story.mother_name && <p className="text-sm">Mother: {story.mother_name}</p>}
              </div>
            </div>
            {story.qualifications && <p className="mb-2"><strong>Education:</strong> {story.qualifications}</p>}
            {story.achievements && <p className="mb-2"><strong>Achievements:</strong> {story.achievements}</p>}
            {story.hobbies && <p className="mb-2"><strong>Hobbies:</strong> {story.hobbies}</p>}
            {story.story_text && <p className="mt-4 leading-relaxed">{story.story_text}</p>}
          </div>
        ))}
      </div>

      {/* Modal */}
      <StoryModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        token={token}
        onStoryUpdate={handleStoryUpdate}
        onDelete={deleteStory}
      />
    </div>
  );
}
