import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BoardProvider } from './providers/BoardProvider';
import AppShell from './components/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'iTask – Kanban Task Management',
  description: 'A beautiful Trello-like kanban board for managing your tasks and projects.',
  keywords: ['task management', 'kanban', 'productivity', 'project management'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body style={{ display: 'flex', minHeight: '100dvh', overflow: 'hidden' }}>
        <BoardProvider>
          <AppShell>{children}</AppShell>
        </BoardProvider>
      </body>
    </html>
  );
}
