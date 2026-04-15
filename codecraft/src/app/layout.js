// src/app/layout.js
import '@/styles/globals.css';
import TerminalEasterEgg from '@/components/TerminalEasterEgg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookmarksProvider } from '@/lib/BookmarksContext';

export const metadata = {
  metadataBase: new URL('https://codecraft.vercel.app'),
  title: {
    template: '%s | Code Craft',
    default: 'Code Craft – Open‑Source Discoveries & Developer Stories',
  },
  description: 'Discover open‑source projects and read thoughtful developer articles. Built for search and AI.',
  keywords: ['Open Source', 'Developer Blog', 'Next.js 14', 'MDX', 'Software Engineering', 'AI Citations', 'Code Craft'],
  authors: [{ name: 'Code Craft Community' }],
  openGraph: {
    type: 'website',
    siteName: 'Code Craft',
    title: 'Code Craft – Open‑Source Discoveries & Developer Stories',
    description: 'Discover open‑source projects and read thoughtful developer articles. Built for search and AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Craft – Open‑Source Discoveries & Developer Stories',
    description: 'Discover open‑source projects and read thoughtful developer articles. Built for search and AI.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <BookmarksProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <TerminalEasterEgg />
        </BookmarksProvider>
      </body>
    </html>
  );
}
