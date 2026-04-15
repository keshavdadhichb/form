# सांवलराम मकुदेवी परिवार — Family Legacy Website

A bilingual (Hindi/English) family story-sharing website. Family members access it via a WhatsApp link, choose their language, and share their life story in text, audio, video, or file upload.

---

## Setup (5 minutes)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, fill in a name and password
3. Wait ~2 minutes for it to spin up

### 2. Run the database migration

1. In your Supabase Dashboard, click **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase-migration.sql`
3. Click **Run**

This creates:
- The `stories` table with all fields and RLS policies
- Two public storage buckets: `pariwar-photos` and `pariwar-media`

### 3. Get your keys

In your Supabase Dashboard → **Settings** → **API**:

- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** key → this is `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret**)

### 4. Set environment variables

**For local development:**
```bash
cp .env.local.example .env.local
# Edit .env.local and paste your values
```

**For Vercel production:**
1. Push this repo to GitHub
2. Import it in [vercel.com/new](https://vercel.com/new)
3. In the Vercel project settings → **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (choose something memorable but not obvious)

### 5. Deploy

```bash
# Local development
npm run dev

# Production (requires Vercel CLI)
npm install -g vercel
vercel --prod
```

---

## Usage

- **Family form**: Share the Vercel URL (or your custom domain) via WhatsApp
- **Admin panel**: Visit `/admin`, enter your `ADMIN_PASSWORD`

### Admin panel features
- View all stories in a card gallery
- Search by name, filter by story type and language
- Click any card to view the full story, audio, or video
- Toggle "Hide" on individual entries (for curation)
- Print view: `Ctrl+P` / `⌘+P` generates a clean printable book layout

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database + Storage | Supabase |
| State | Zustand + React Hook Form |
| Image compression | browser-image-compression |
| Hosting | Vercel |

---

## File structure

```
app/
├── layout.tsx              — Fonts (Inter, Fraunces, Tiro Devanagari Hindi), I18n provider
├── page.tsx                — Main multi-step flow with AnimatePresence transitions
├── globals.css             — Design tokens, Tailwind v4 theme
├── admin/
│   └── page.tsx            — Admin gallery + modal
└── api/
    ├── submit/route.ts     — POST: receive form, upload to Supabase, insert row
    └── admin/
        ├── stories/route.ts          — GET: list all stories (admin auth required)
        └── stories/[id]/route.ts     — PATCH: toggle hidden flag

components/
├── flow/                   — Step components (Language, Welcome, Photo, Basics, About, Story, Review, Success)
├── ui/                     — Button, Input, Textarea, Card, ProgressPetals
├── recorders/              — AudioRecorder, VideoRecorder (MediaRecorder API)
└── admin/                  — StoryCard, StoryModal

lib/
├── translations.ts         — All UI strings (Hindi + English), translation function
├── i18n.tsx                — Language context provider + useTranslation hook
├── store.ts                — Zustand form state
├── compress.ts             — Client-side image compression
└── supabase.ts             — Supabase client (browser + admin)
```

---

## Design tokens

All colors are defined as CSS custom properties in `globals.css` and surfaced as Tailwind colors:

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#FDF8F3` | Background |
| `terracotta` | `#E8B298` | Primary CTA |
| `sage` | `#A8B8A0` | Success states |
| `rose` | `#D4A5A5` | Error states |
| `wheat` | `#E8D5B7` | Tertiary accent |
| `ink` | `#3D3330` | Primary text |

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (**server-only**) |
| `ADMIN_PASSWORD` | ✅ | Password for `/admin` access |
