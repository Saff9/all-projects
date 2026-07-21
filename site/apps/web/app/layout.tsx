import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://jeeneet.com'),
  title: {
    default: 'JEENEET - NEET/JEE Preparation',
    template: '%s | JEENEET',
  },
  description: 'India\'s most structured free NEET/JEE preparation platform. Practice PYQs, take mock tests, track progress, and ace your exams.',
  keywords: ['NEET', 'JEE', 'JEE Main', 'JEE Advanced', 'Medical', 'Engineering', 'Preparation', 'Mock Tests', 'PYQ'],
  authors: [{ name: 'JEENEET Team' }],
  creator: 'JEENEET',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://jeeneet.com',
    siteName: 'JEENEET - NEET/JEE Preparation',
    description: 'India\'s most structured free NEET/JEE preparation platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JEENEET - NEET/JEE Preparation',
    description: 'India\'s most structured free NEET/JEE preparation platform.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
