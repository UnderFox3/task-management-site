'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBoardContext } from '@/app/providers/BoardProvider';
import NewBoardModal from './NewBoardModal';
import { ADMIN_ID, JANE_ID, ALEX_ID } from '@/lib/store';

export default function Sidebar() {
  const { state, deleteBoard, currentUser, logout, switchUser } = useBoardContext();
  const pathname = usePathname();
  const router = useRouter();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // My boards: owned or explicitly invited
  const myBoards = state.boardOrder.filter((boardId) => {
    const board = state.boards[boardId];
    if (!board) return false;
    if (board.ownerId === currentUser?.id) return true;
    if (board.members[currentUser?.id ?? '']) return true;
    return false;
  });

  // Public boards created by others
  const otherPublicBoards = state.boardOrder.filter((boardId) => {
    const board = state.boards[boardId];
    if (!board) return false;
    if (board.visibility === 'public' && !myBoards.includes(boardId)) return true;
    return false;
  });

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function renderBoardItem(boardId: string, isPublicCommunity = false) {
    const board = state.boards[boardId];
    if (!board) return null;
    const isActive = pathname === `/board/${boardId}`;
    const isOwner = board.ownerId === currentUser?.id;

    return (
      <div
        key={boardId}
        style={{
          position: 'relative',
          marginBottom: '2px',
        }}
        onMouseEnter={(e) => {
          const del = e.currentTarget.querySelector<HTMLButtonElement>('.delete-btn');
          if (del) del.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          const del = e.currentTarget.querySelector<HTMLButtonElement>('.delete-btn');
          if (del) del.style.opacity = '0';
        }}
      >
        <Link
          href={`/board/${boardId}`}
          title={board.title}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '10px' : '9px 10px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: isActive ? 'rgba(124, 58, 237, 0.16)' : 'transparent',
            border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 450,
            transition: 'all 0.15s ease',
          }}
        >
          {/* Accent dot or lock/globe */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: board.accent || 'var(--accent-500)',
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {board.title}
            </span>
          )}
          {!collapsed && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '6px',
                background: board.visibility === 'public' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: board.visibility === 'public' ? '#4ade80' : 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {board.visibility === 'public' ? 'Pub' : 'Priv'}
            </span>
          )}
        </Link>

        {/* Delete button (only for owner) */}
        {!collapsed && isOwner && (
          <button
            type="button"
            className="delete-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeletingId(boardId);
            }}
            title="Delete board"
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              opacity: 0,
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              transition: 'opacity 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <aside
        style={{
          width: collapsed ? '72px' : '250px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 0.28s var(--ease-smooth)',
          overflow: 'hidden',
          height: '100dvh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: collapsed ? 'column' : 'row',
            alignItems: 'center',
            gap: collapsed ? '12px' : '10px',
            padding: collapsed ? '12px 8px 10px' : '18px 16px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
            position: 'relative',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {/* Logo mark */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                flexShrink: 0,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-500), var(--accent-300))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 0 16px var(--accent-glow)',
              }}
            >
              T
            </div>
            {!collapsed && (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '-0.3px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                iTask
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              marginLeft: collapsed ? '0' : 'auto',
              background: collapsed ? 'var(--bg-sidebar)' : 'none',
              border: collapsed ? '1px solid var(--border-medium)' : 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              ) : (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* ── User Profile & Quick Switcher ── */}
        {!collapsed && currentUser && (
          <div
            style={{
              margin: '12px 10px 4px',
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.username}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                style={{
                  border: '1px solid var(--border-medium)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Sign out
              </button>
            </div>

            {/* Quick Test Switcher Bar */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(124, 58, 237, 0.15)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Switch Account:
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => switchUser(ADMIN_ID)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    background: currentUser.id === ADMIN_ID ? 'var(--accent-500)' : 'var(--bg-subtle)',
                    color: currentUser.id === ADMIN_ID ? '#fff' : 'var(--text-secondary)',
                  }}
                  title="Switch to Admin"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchUser(JANE_ID)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    background: currentUser.id === JANE_ID ? 'var(--accent-500)' : 'var(--bg-subtle)',
                    color: currentUser.id === JANE_ID ? '#fff' : 'var(--text-secondary)',
                  }}
                  title="Switch to Jane"
                >
                  Jane
                </button>
                <button
                  type="button"
                  onClick={() => switchUser(ALEX_ID)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    background: currentUser.id === ALEX_ID ? 'var(--accent-500)' : 'var(--bg-subtle)',
                    color: currentUser.id === ALEX_ID ? '#fff' : 'var(--text-secondary)',
                  }}
                  title="Switch to Alex"
                >
                  Alex
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Board Navigation ── */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 8px',
          }}
        >
          {/* My Boards */}
          {!collapsed && (
            <div
              style={{
                padding: '8px 10px 4px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>My Boards ({myBoards.length})</span>
            </div>
          )}
          {myBoards.map((id) => renderBoardItem(id, false))}

          {/* Public Boards */}
          {otherPublicBoards.length > 0 && (
            <>
              {!collapsed && (
                <div
                  style={{
                    padding: '16px 10px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🌐 Public Boards ({otherPublicBoards.length})</span>
                </div>
              )}
              {otherPublicBoards.map((id) => renderBoardItem(id, true))}
            </>
          )}
        </nav>

        {/* ── New Board Button ── */}
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            id="new-board-btn"
            onClick={() => setShowNewBoard(true)}
            title="New board"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: '9px 10px',
              borderRadius: '10px',
              background: 'none',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {!collapsed && <span>New Board</span>}
          </button>
        </div>
      </aside>

      {/* Delete confirmation */}
      {deletingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          className="animate-overlay-in"
          onClick={() => setDeletingId(null)}
        >
          <div
            style={{
              background: 'var(--bg-modal)',
              border: '1px solid var(--border-medium)',
              borderRadius: '20px',
              padding: '28px 32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: 'var(--shadow-modal)',
            }}
            className="animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Delete Board?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
              All columns and cards in <strong style={{ color: 'var(--text-primary)' }}>{state.boards[deletingId]?.title}</strong> will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingId(null)}
                style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBoard(deletingId);
                  setDeletingId(null);
                  if (pathname === `/board/${deletingId}`) {
                    router.push('/');
                  }
                }}
                style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewBoard && <NewBoardModal onClose={() => setShowNewBoard(false)} />}
    </>
  );
}
