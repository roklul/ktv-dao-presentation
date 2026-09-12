import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '修行法語 · 濟公活佛 KTV 聲光同步簡報',
  description: 'Self-Cultivation & Dao Practice · Audio-Visual Presentation with Gemini 3.1 TTS',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0805',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-1.5 sm:p-4 bg-gradient-to-b from-[#0f0c08] via-[#17110a] to-[#0a0805] text-stone-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
