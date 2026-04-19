'use client';

import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from '@react-pdf/renderer';
import type { Story } from '@/lib/supabase';

// Register Noto Serif for Hindi/Devanagari support
Font.register({
  family: 'NotoSerif',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.1.1/files/noto-serif-latin-400-normal.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.1.1/files/noto-serif-latin-700-normal.woff2',
      fontWeight: 700,
    },
  ],
});

// Register a Devanagari-capable font for Hindi text
Font.register({
  family: 'NotoDevanagari',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@5.1.0/files/noto-sans-devanagari-devanagari-400-normal.woff2',
});

// ── Design tokens (print-safe) ──────────────────────────────────────────────
const C = {
  terracotta: '#B85C35',
  terracottaLight: '#E8B298',
  wheat: '#C8963A',
  wheatLight: '#F0DFB8',
  ink: '#2C1810',
  muted: '#8C6E4E',
  hint: '#B8956A',
  cream: '#FDF8F3',
  sage: '#5A7A52',
};

const S = StyleSheet.create({
  page: {
    backgroundColor: C.cream,
    paddingTop: 52,
    paddingBottom: 68,
    paddingLeft: 54,
    paddingRight: 54,
    fontFamily: 'Helvetica',
  },

  // ── Left accent bar ────────────────────────────────────────────────────────
  leftBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 5,
    backgroundColor: C.terracotta,
  },
  // Small top corner decoration
  cornerDot: {
    position: 'absolute',
    top: 0, left: 0,
    width: 28, height: 28,
    backgroundColor: C.terracotta,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 16, height: 16,
    backgroundColor: C.wheatLight,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  familyName: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: C.hint,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 18,
  },

  // ── Photo ──────────────────────────────────────────────────────────────────
  photoRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: C.terracotta,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  initials: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.wheatLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    color: C.terracotta,
  },

  // ── Name + details ─────────────────────────────────────────────────────────
  name: {
    fontFamily: 'NotoSerif',
    fontWeight: 700,
    fontSize: 28,
    color: C.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  badgePill: {
    backgroundColor: C.wheatLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 3,
  },
  badgeText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: C.wheat,
    letterSpacing: 0.5,
  },
  subLine: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 3,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: C.terracottaLight,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: C.terracotta,
    marginHorizontal: 10,
    transform: 'rotate(45deg)',
  },

  // ── Life details grid ──────────────────────────────────────────────────────
  lifeGrid: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  lifeCell: {
    flex: 1,
    paddingRight: 14,
  },
  lifeCellMid: {
    flex: 1,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: C.wheatLight,
    borderLeftStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: C.wheatLight,
    borderRightStyle: 'solid',
  },
  lifeCellRight: {
    flex: 1,
    paddingLeft: 14,
  },
  lifeLabel: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: C.terracotta,
    letterSpacing: 2,
    marginBottom: 5,
  },
  lifeValue: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: C.ink,
    lineHeight: 1.55,
  },

  // ── Story text ─────────────────────────────────────────────────────────────
  storyWrap: {
    marginTop: 4,
  },
  quoteOpen: {
    fontFamily: 'NotoSerif',
    fontSize: 56,
    color: C.terracotta,
    lineHeight: 0.75,
    marginBottom: -4,
    opacity: 0.3,
  },
  storyText: {
    fontFamily: 'NotoSerif',
    fontSize: 10.5,
    color: C.ink,
    lineHeight: 1.9,
  },
  aiNote: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.hint,
    fontStyle: 'italic',
    marginTop: 10,
  },

  // ── Summary block ──────────────────────────────────────────────────────────
  summaryBlock: {
    backgroundColor: C.wheatLight,
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  summaryText: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: C.ink,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },

  // ── Tags ───────────────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tagPill: {
    backgroundColor: C.wheatLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: C.wheat,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 54,
    right: 54,
  },
  footerLine: {
    height: 0.75,
    backgroundColor: C.wheatLight,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontFamily: 'NotoSerif',
    fontSize: 8,
    color: C.hint,
  },
  footerRight: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.hint,
  },
  footerCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.terracottaLight,
  },
});

// ── Helper components ─────────────────────────────────────────────────────────

function Divider() {
  return (
    <View style={S.dividerRow}>
      <View style={S.dividerLine} />
      <View style={S.dividerDiamond} />
      <View style={S.dividerLine} />
    </View>
  );
}

function formatDobFull(dob: string | null): string {
  if (!dob) return '';
  try {
    return new Date(dob).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dob; }
}

function formatDateShort(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
}

// ── Main PDF document ─────────────────────────────────────────────────────────

interface Props { story: Story }

export default function StoryPDF({ story }: Props) {
  const initials = story.name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const dobLine = story.dob ? formatDobFull(story.dob) : null;
  const parentLine = [
    story.father_name ? `Father: ${story.father_name}` : null,
    story.mother_name ? `Mother: ${story.mother_name}` : null,
  ].filter(Boolean).join('   ·   ');

  const storyBody = story.story_text ?? null;
  const hasLife = story.qualifications || story.achievements || story.hobbies;
  const lifeFields = [
    story.qualifications ? { label: 'EDUCATION', value: story.qualifications } : null,
    story.achievements  ? { label: 'CAREER', value: story.achievements }      : null,
    story.hobbies       ? { label: 'HOBBIES', value: story.hobbies }          : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const storyTypeLabel = {
    text:   'Written story',
    audio:  'Audio story',
    video:  'Video story',
    upload: 'Uploaded story',
  }[story.story_type] ?? story.story_type;

  const langLabel = story.language === 'hi' ? 'हिन्दी' : 'English';

  return (
    <Document
      title={`${story.name} — Family Story`}
      author="Sanwalram Makhudevi Pariwar"
    >
      <Page size="A4" style={S.page}>

        {/* Corner accents */}
        <View style={S.cornerDot} />
        <View style={S.cornerDotBR} />

        {/* Left accent stripe */}
        <View style={S.leftBar} />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={S.header}>
          <Text style={S.familyName}>SANWALRAM MAKHUDEVI PARIWAR</Text>

          {/* Photo */}
          <View style={S.photoRing}>
            {story.photo_url ? (
              <Image src={story.photo_url} style={S.photo} />
            ) : (
              <View style={S.initials}>
                <Text style={S.initialsText}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={S.name}>{story.name}</Text>

          {/* Badges */}
          <View style={S.badge}>
            <View style={S.badgePill}><Text style={S.badgeText}>{langLabel}</Text></View>
            <View style={S.badgePill}><Text style={S.badgeText}>{storyTypeLabel}</Text></View>
          </View>

          {/* DOB + Parents */}
          {dobLine    && <Text style={S.subLine}>{dobLine}</Text>}
          {parentLine && <Text style={S.subLine}>{parentLine}</Text>}
        </View>

        {/* ── Life details ────────────────────────────────────────────────── */}
        {hasLife && (
          <>
            <Divider />
            <View style={S.lifeGrid}>
              {lifeFields.map((f, i) => {
                const cellStyle =
                  lifeFields.length === 3
                    ? (i === 0 ? S.lifeCell : i === 1 ? S.lifeCellMid : S.lifeCellRight)
                    : (i === 0 ? S.lifeCell : S.lifeCellRight);
                return (
                  <View key={f.label} style={cellStyle}>
                    <Text style={S.lifeLabel}>{f.label}</Text>
                    <Text style={S.lifeValue}>{f.value}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Story / Summary ─────────────────────────────────────────────── */}
        {(storyBody || story.summary) && (
          <>
            <Divider />
            <View style={S.storyWrap}>
              {storyBody ? (
                <>
                  <Text style={S.quoteOpen}>"</Text>
                  <Text style={S.storyText}>{storyBody}</Text>
                </>
              ) : story.summary ? (
                <View style={S.summaryBlock}>
                  <Text style={S.summaryText}>{story.summary}</Text>
                  <Text style={S.aiNote}>— AI-generated summary</Text>
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        {story.tags && story.tags.length > 0 && (
          <View style={S.tagsRow}>
            {story.tags.map((tag) => (
              <View key={tag} style={S.tagPill}>
                <Text style={S.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <View style={S.footer}>
          <View style={S.footerLine} />
          <View style={S.footerRow}>
            <Text style={S.footerLeft}>सांवलराम मखुदेवी परिवार</Text>
            <View style={S.footerCenter} />
            <Text style={S.footerRight}>{formatDateShort(story.created_at)}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
