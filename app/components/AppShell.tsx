'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { useBoardContext } from '@/app/providers/BoardProvider';
import { Route } from 'next';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isBoardAccessible, state, logout } = useBoardContext();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!currentUser && !isAuthRoute) {
      const returnTo = typeof window === 'undefined' ? pathname : `${pathname}${window.location.search}`;
      const redirectUrl = returnTo && returnTo !== '/' ? `/login?redirect=${encodeURIComponent(returnTo)}` : '/login';
      router.replace(redirectUrl as Route);
    }
    if (currentUser && isAuthRoute) {
      const requestedPath = typeof window === 'undefined'
        ? null
        : new URLSearchParams(window.location.search).get('redirect');
      const destination = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/';
      router.replace(destination as Route);
    }
  }, [currentUser, isAuthRoute, pathname, router]);

  // If on login or signup, render the page without the dashboard sidebar
  if (isAuthRoute) {
    return (
      <main
        style={{
          flex: 1,
          width: '100%',
          height: '100dvh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
    );
  }

  // If not logged in and waiting for redirect
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirecting to sign in...</div>
      </div>
    );
  }

  const isBoardRoute = /^\/board\//.test(pathname);
  const boardId = isBoardRoute ? pathname.split('/board/')[1] : null;
  const board = boardId ? state.boards[boardId] : null;
  const boardAccess = boardId ? isBoardAccessible(boardId) : true;

  if (isBoardRoute && boardId && !boardAccess) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: '32px 28px', background: 'var(--bg-modal)', border: '1px solid var(--border-medium)', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
            🔒
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 700 }}>Access denied</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            {board
              ? 'This board is private and you are not currently invited to collaborate or view it.'
              : 'This board does not exist or has been removed.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Back to Home
            </Link>
            <button
              type="button"
              onClick={async () => {
                try {
                  await logout();
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}` as Route);
                } catch (error) {
                  console.error('Sign out failed:', error);
                }
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
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
