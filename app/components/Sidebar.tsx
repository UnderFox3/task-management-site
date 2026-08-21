'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useBoardContext } from '@/app/providers/BoardProvider';
import NewBoardModal from './NewBoardModal';

export default function Sidebar() {
  const { state, deleteBoard } = useBoardContext();
  const pathname = usePathname();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <>
      <aside
        style={{
          width: collapsed ? '60px' : '240px',
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
            alignItems: 'center',
            gap: '10px',
            padding: '20px 16px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          {/* Logo mark */}
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
              TaskFlow
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-subtle)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed
                ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>

        {/* ── Boards Label ── */}
        {!collapsed && (
          <div
            style={{
              padding: '16px 16px 8px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            Boards
          </div>
        )}

        {/* ── Board List ── */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 8px',
          }}
        >
          {state.boardOrder.map((boardId) => {
            const board = state.boards[boardId];
            if (!board) return null;
            const isActive = pathname === `/board/${boardId}`;
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: collapsed ? '10px' : '9px 10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  {/* Colour dot */}
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: board.accent,
                      flexShrink: 0,
                      boxShadow: isActive ? `0 0 8px ${board.accent}88` : 'none',
                    }}
                  />
                  {!collapsed && (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {board.title}
                    </span>
                  )}
                </Link>

                {/* Delete board button */}
                {!collapsed && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeletingId(boardId);
                    }}
                    title="Delete board"
                    style={{
                      position: 'absolute',
                      right: '8px',
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
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── New Board Button ── */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
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
              borderRadius: '8px',
              background: 'none',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-500)';
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-300)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'none';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
              borderRadius: '16px',
              padding: '28px 32px',
              maxWidth: '380px',
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
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteBoard(deletingId); setDeletingId(null); }}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
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
