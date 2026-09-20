'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import AuthScreen from './AuthScreen';
import { useBoardContext } from '@/app/providers/BoardProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isBoardAccessible } = useBoardContext();
  const pathname = usePathname();

  if (!currentUser) {
    return <AuthScreen />;
  }

  const isBoardRoute = /^\/board\//.test(pathname);
  const boardId = isBoardRoute ? pathname.split('/board/')[1] : null;
  const boardAccess = boardId ? isBoardAccessible(boardId) : true;

  if (isBoardRoute && boardId && !boardAccess) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '460px', padding: '24px 28px', background: 'var(--bg-modal)', border: '1px solid var(--border-medium)', borderRadius: '20px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Access denied</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This board is private and you are not currently invited to collaborate or view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </>
  );
}
