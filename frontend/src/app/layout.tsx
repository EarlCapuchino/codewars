import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CODEWORDS.EXE - Word Guessing Terminal',
  description: 'A retro terminal word guessing game with AI opponent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col crt-screen">
        {children}
      </body>
    </html>
  );
}
