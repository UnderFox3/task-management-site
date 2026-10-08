'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/app/providers/BoardProvider';

export default function AcceptInvitation({ token }: { token: string }) {
  const { currentUser, refreshState } = useBoardContext();
  const router = useRouter();
  const [message, setMessage] = useState('Checking invitation…');
  const [acceptedBoardId, setAcceptedBoardId] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!currentUser || !token || attempted.current) return;
    attempted.current = true;
    void (async () => {
      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const result = await response.json() as { message?: string; boardId?: string };
        if (!response.ok || !result.boardId) {
          setMessage(result.message ?? 'Unable to accept this invitation.');
          return;
        }
        setMessage(result.message ?? 'Invitation accepted.');
        await refreshState();
        setAcceptedBoardId(result.boardId);
      } catch (error) {
        console.error('Invitation acceptance request failed:', error);
        setMessage('Unable to accept this invitation. Please try again.');
      }
    })();
  }, [currentUser, refreshState, token]);

  useEffect(() => {
    if (!acceptedBoardId) return;
    router.replace(`/board/${encodeURIComponent(acceptedBoardId)}`);
  }, [acceptedBoardId, router]);

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-base)' }}>
      <section style={{ maxWidth: 480, width: '100%', padding: 28, borderRadius: 20, border: '1px solid var(--border-medium)', background: 'var(--bg-modal)', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
        <h1 style={{ marginTop: 0 }}>Board invitation</h1>
        <p role="status" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
        {!currentUser && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sign in with the email address this invitation was sent to.</p>}
        {currentUser && !token && <p style={{ color: '#fca5a5', fontSize: 13 }}>This invitation link is missing its token.</p>}
      </section>
    </main>
  );
}
