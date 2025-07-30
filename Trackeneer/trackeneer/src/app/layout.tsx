import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './components/Providers'; // Corrected Path
import Navbar from './components/Navbar'; // Corrected Path

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trackeneer',
  description: 'From Classroom to Career, Engineered.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}