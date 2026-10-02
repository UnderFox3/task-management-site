'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from './providers/BoardProvider';

export default function Home() {
  const { state, isBoardAccessible, currentUser } = useBoardContext();
  const router = useRouter();
  const myBoards = state.boardOrder.filter((boardId) => {
    const board = state.boards[boardId];
    if (!board) return false;
    if (board.ownerId === currentUser?.id) return true;
    if (board.members[currentUser?.id ?? '']) return true;
    return false;
  });

  const accessibleBoards = state.boardOrder.filter((boardId) => {
    const board = state.boards[boardId];
    if (!board) return false;
    return isBoardAccessible(boardId);
  });

  const hasBoards = myBoards.length > 0 || accessibleBoards.length > 0;

  useEffect(() => {
    if (!currentUser) return;

    router.replace("/");
  }, [currentUser, router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '32px',
      }}
    >
      {!hasBoards ? (
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-modal)',
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: '28px', letterSpacing: '-0.04em' }}>No boards yet</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You do not have access to any boards yet. Create your own board to start collaborating.
          </p>
          <button
            type="button"
            onClick={() => {
              const newBoardBtn = document.getElementById('new-board-btn');
              newBoardBtn?.click();
            }}
            style={{
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              padding: '11px 20px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create your first board
          </button>
        </div>
      ) : (
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-modal)',
          }}>
          <>
            <h2 style={{ margin: '0 0 12px', fontSize: '28px', letterSpacing: '-0.04em' }}>Welcome back, {currentUser?.username}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Select a board from the sidebar to continue working</p>
          </>
        </div>
      )}
    </div>
  );
}
