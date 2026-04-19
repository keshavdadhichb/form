'use client';

import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from '@react-pdf/renderer';
import type { Story } from '@/lib/supabase';

// ── Font registration ────────────────────────────────────────────────────────
// Noto Sans Devanagari covers both Devanagari (Hindi) and Latin glyphs.
// Files are served from /public/fonts/ as static assets.
// Font.register is safe to call at module level in a 'use client' file.
Font.register({
  family: 'NotoDevanagari',
  fonts: [
    { src: '/fonts/NotoSansDevanagari-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSansDevanagari-Bold.ttf',    fontWeight: 700 },
  ],
});

// ── Colour palette ───────────────────────────────────────────────────────────
const C = {
  terracotta: '#B85C35',
  terracottaLight: '#E8B298',
  wheat: '#C8963A',
  wheatLight: '#F0DFB8',
  ink: '#2C1810',
  muted: '#8C6E4E',
  hint: '#B8956A',
  cream: '#FDF8F3',
};

// ── Shared style helper: pick font by language ───────────────────────────────
// Hindi stories use NotoDevanagari; English uses Times-Roman/Helvetica.
function bodyFont(isHindi: boolean): 'NotoDevanagari' | 'Times-Roman' {
  return isHindi ? 'NotoDevanagari' : 'Times-Roman';
}
function uiFont(isHindi: boolean): 'NotoDevanagari' | 'Helvetica' {
  return isHindi ? 'NotoDevanagari' : 'Helvetica';
}

const S = StyleSheet.create({
  page: {
    backgroundColor: C.cream,
    paddingTop: 52,
    paddingBottom: 68,
    paddingLeft: 54,
    paddingRight: 54,
    fontFamily: 'Helvetica',
  },

  // Corner accents
  cornerTL: {
    position: 'absolute', left: 0, top: 0,
    width: 28, height: 28,
    backgroundColor: C.terracotta,
  },
  cornerBR: {
    position: 'absolute', right: 0, bottom: 0,
    width: 16, height: 16,
    backgroundColor: C.wheatLight,
  },
  leftBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 5, backgroundColor: C.terracotta,
  },

  // Header
  header: { alignItems: 'center', marginBottom: 22 },
  familyName: {
    fontFamily: 'Helvetica',
    fontSize: 7, color: C.hint,
    letterSpacing: 3, textAlign: 'center', marginBottom: 18,
  },

  // Photo ring
  photoRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 2, borderColor: C.terracotta, borderStyle: 'solid',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  photo: { width: 84, height: 84, borderRadius: 42 },
  initials: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: C.wheatLight,
    alignItems: 'center', justifyContent: 'center',
  },
  initialsText: {
    fontFamily: 'Helvetica-Bold', fontSize: 26, color: C.terracotta,
  },

  // Name & sub-details
  badge: { flexDirection: 'row', justifyContent: 'center', marginBottom: 5 },
  badgePill: {
    backgroundColor: C.wheatLight, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginHorizontal: 3,
  },
  badgeText: {
    fontFamily: 'Helvetica', fontSize: 7.5, color: C.wheat, letterSpacing: 0.5,
  },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 0.75, backgroundColor: C.terracottaLight },
  dividerDiamond: {
    width: 6, height: 6, backgroundColor: C.terracotta,
    marginHorizontal: 10,
  },

  // Life details grid
  lifeGrid: { flexDirection: 'row', marginBottom: 4 },
  lifeCell: { flex: 1, paddingRight: 14 },
  lifeCellMid: {
    flex: 1, paddingHorizontal: 14,
    borderLeftWidth: 1, borderLeftColor: C.wheatLight, borderLeftStyle: 'solid',
    borderRightWidth: 1, borderRightColor: C.wheatLight, borderRightStyle: 'solid',
  },
  lifeCellRight: { flex: 1, paddingLeft: 14 },
  lifeLabel: {
    fontFamily: 'Helvetica', fontSize: 6,
    color: C.terracotta, letterSpacing: 2, marginBottom: 5,
  },

  // Story
  quoteOpen: {
    fontFamily: 'Times-Bold', fontSize: 56, color: C.terracotta,
    lineHeight: 0.75, marginBottom: -4, opacity: 0.3,
  },

  // Summary fallback
  summaryBlock: {
    backgroundColor: C.wheatLight, borderRadius: 6, padding: 10, marginTop: 4,
  },
  aiNote: {
    fontFamily: 'Helvetica', fontSize: 8, color: C.hint,
    fontStyle: 'italic', marginTop: 8,
  },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tagPill: {
    backgroundColor: C.wheatLight, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3, marginRight: 5, marginBottom: 5,
  },

  // Footer
  footer: { position: 'absolute', bottom: 28, left: 54, right: 54 },
  footerLine: { height: 0.75, backgroundColor: C.wheatLight, marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { fontFamily: 'Helvetica', fontSize: 8, color: C.hint },
  footerRight: { fontFamily: 'Helvetica', fontSize: 8, color: C.hint },
  footerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.terracottaLight },
});

function Divider() {
  return (
    <View style={S.dividerRow}>
      <View style={S.dividerLine} />
      <View style={S.dividerDiamond} />
      <View style={S.dividerLine} />
    </View>
  );
}

function formatDobFull(dob: string | null) {
  if (!dob) return '';
  try {
    return new Date(dob).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dob; }
}

function formatDateShort(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
}

export default function StoryPDF({ story }: { story: Story }) {
  const isHindi = story.language === 'hi';
  const initials = story.name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const dobLine = formatDobFull(story.dob);
  const parentLine = [
    story.father_name ? `Father: ${story.father_name}` : null,
    story.mother_name ? `Mother: ${story.mother_name}` : null,
  ].filter(Boolean).join('   ·   ');

  const lifeFields = [
    story.qualifications ? { label: 'EDUCATION', value: story.qualifications } : null,
    story.achievements   ? { label: 'CAREER',    value: story.achievements }   : null,
    story.hobbies        ? { label: 'HOBBIES',   value: story.hobbies }        : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const storyTypeLabel: Record<string, string> = {
    text: 'Written', audio: 'Audio', video: 'Video', upload: 'Uploaded',
  };
  const langLabel = isHindi ? 'Hindi' : 'English';

  // Dynamic font styles built from language
  const nameStyle = {
    fontFamily: isHindi ? 'NotoDevanagari' : 'Times-Bold',
    fontWeight: isHindi ? (700 as const) : undefined,
    fontSize: 28,
    color: C.ink,
    textAlign: 'center' as const,
    marginBottom: 6,
  };
  const subLineStyle = {
    fontFamily: uiFont(isHindi),
    fontSize: 9.5,
    color: C.muted,
    textAlign: 'center' as const,
    marginBottom: 3,
  };
  const lifeValueStyle = {
    fontFamily: uiFont(isHindi),
    fontSize: 9.5,
    color: C.ink,
    lineHeight: 1.55,
  };
  const storyTextStyle = {
    fontFamily: bodyFont(isHindi),
    fontWeight: isHindi ? (400 as const) : undefined,
    fontSize: isHindi ? 11.5 : 10.5,
    color: C.ink,
    lineHeight: isHindi ? 2.1 : 1.9,
  };
  const summaryTextStyle = {
    fontFamily: uiFont(isHindi),
    fontSize: 9.5,
    color: C.ink,
    lineHeight: 1.6,
    fontStyle: isHindi ? undefined : ('italic' as const),
  };
  const tagTextStyle = {
    fontFamily: uiFont(isHindi),
    fontSize: 7.5,
    color: C.wheat,
  };

  return (
    <Document title={`${story.name} — Family Story`} author="Sanwalram Makhudevi Pariwar">
      <Page size="A4" style={S.page}>

        <View style={S.cornerTL} />
        <View style={S.cornerBR} />
        <View style={S.leftBar} />

        {/* Header */}
        <View style={S.header}>
          <Text style={S.familyName}>SANWALRAM MAKHUDEVI PARIWAR</Text>

          <View style={S.photoRing}>
            {story.photo_url ? (
              <Image src={story.photo_url} style={S.photo} />
            ) : (
              <View style={S.initials}>
                <Text style={S.initialsText}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={nameStyle}>{story.name}</Text>

          <View style={S.badge}>
            <View style={S.badgePill}><Text style={S.badgeText}>{langLabel}</Text></View>
            <View style={S.badgePill}><Text style={S.badgeText}>{storyTypeLabel[story.story_type] ?? story.story_type}</Text></View>
          </View>

          {!!dobLine    && <Text style={subLineStyle}>{dobLine}</Text>}
          {!!parentLine && <Text style={subLineStyle}>{parentLine}</Text>}
        </View>

        {/* Life details */}
        {lifeFields.length > 0 && (
          <>
            <Divider />
            <View style={S.lifeGrid}>
              {lifeFields.map((f, i) => {
                const cellStyle =
                  lifeFields.length === 3
                    ? ([S.lifeCell, S.lifeCellMid, S.lifeCellRight][i])
                    : (i === 0 ? S.lifeCell : S.lifeCellRight);
                return (
                  <View key={f.label} style={cellStyle}>
                    <Text style={S.lifeLabel}>{f.label}</Text>
                    <Text style={lifeValueStyle}>{f.value}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Story / Summary */}
        {(story.story_text || story.summary) && (
          <>
            <Divider />
            {story.story_text ? (
              <>
                {!isHindi && <Text style={S.quoteOpen}>{'"'}</Text>}
                <Text style={storyTextStyle}>{story.story_text}</Text>
              </>
            ) : (
              <View style={S.summaryBlock}>
                <Text style={summaryTextStyle}>{story.summary}</Text>
                <Text style={S.aiNote}>— AI-generated summary</Text>
              </View>
            )}
          </>
        )}

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <View style={S.tagsRow}>
            {story.tags.map((tag) => (
              <View key={tag} style={S.tagPill}>
                <Text style={tagTextStyle}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={S.footer}>
          <View style={S.footerLine} />
          <View style={S.footerRow}>
            <Text style={S.footerLeft}>Sanwalram Makhudevi Pariwar</Text>
            <View style={S.footerDot} />
            <Text style={S.footerRight}>{formatDateShort(story.created_at)}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
