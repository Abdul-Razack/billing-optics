import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Billing Optics ERP | Download Center',
  description: 'Download the latest production-grade Billing Optics ERP desktop installer for Windows and Linux. View system requirements, changelogs, and step-by-step upgrade instructions.',
  keywords: ['Optics Shop POS', 'Billing Optics ERP', 'Optics ERP download', 'Billing software', 'POS desktop installer', 'Windows POS', 'Linux POS'],
  authors: [{ name: 'Billing Optics ERP Development Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Billing Optics ERP | Desktop Downloads',
    description: 'Get the latest stable installation packages and complete setup guidelines for the Billing Optics ERP ecosystem.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Billing Optics ERP Download Center',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <Providers>
          {/* Accent radial glow overlay in background */}
          <div className="fixed inset-0 pointer-events-none radial-glow z-0" />
          
          <Navbar />
          <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
