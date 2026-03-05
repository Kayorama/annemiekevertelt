import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/error-boundary';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RenderOwl - Video Creation Made Simple',
    template: '%s | RenderOwl',
  },
  description: 'Create professional videos in minutes. Drag, drop, and export with RenderOwl.',
  keywords: ['video editor', 'video creation', 'timeline editor', 'video export'],
  authors: [{ name: 'RenderOwl' }],
  creator: 'RenderOwl',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://renderowl.com',
    title: 'RenderOwl - Video Creation Made Simple',
    description: 'Create professional videos in minutes.',
    siteName: 'RenderOwl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RenderOwl',
    description: 'Video Creation Made Simple',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ErrorBoundary>
            {children}
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
