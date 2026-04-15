import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Tiro_Devanagari_Hindi } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  preload: true,
  adjustFontFallback: true,
  axes: ['SOFT', 'WONK', 'opsz'],
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-tiro-devanagari',
  preload: true,
  weight: '400',
});

export const metadata: Metadata = {
  title: 'सांवलराम मकुदेवी परिवार | Sanwalram Makudevi Pariwar',
  description: 'अपनी जीवन की कहानी परिवार के साथ साझा करें — Share your life story with the family.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FDF8F3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="hi"
      className={`${inter.variable} ${fraunces.variable} ${tiroDevanagari.variable} h-full`}
    >
      <body className="min-h-full bg-cream text-ink antialiased">
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            इस वेबसाइट के लिए JavaScript ज़रूरी है। कृपया अपने ब्राउज़र में JavaScript चालू करें।
            <br />
            This website requires JavaScript. Please enable JavaScript in your browser.
          </div>
        </noscript>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
