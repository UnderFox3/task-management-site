'use client';

import { useState } from 'react';
import { useBoardContext } from '@/app/providers/BoardProvider';
import Column from './Column';

interface Props {
  boardId: string;
}

export default function BoardView({ boardId }: Props) {
  const { state, addColumn, updateBoard } = useBoardContext();
  const board = state.boards[boardId];

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]         = useState(board?.title ?? '');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle]       = useState('');

  if (!board) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: '16px' }}>
        Board not found.
      </div>
    );
  }

  function saveTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed) updateBoard(boardId, { title: trimmed });
    else setTitleDraft(board.title);
    setIsEditingTitle(false);
  }

  function submitColumn() {
    if (newColTitle.trim()) {
      addColumn(boardId, newColTitle.trim());
      setNewColTitle('');
    }
    setIsAddingColumn(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        height: '100dvh',
      }}
    >
      {/* ── Board Header ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          background: 'var(--bg-base)',
        }}
      >
        {/* Accent indicator */}
        <div
          style={{
            width: '4px',
            height: '28px',
            borderRadius: '4px',
            background: board.accent,
            flexShrink: 0,
            boxShadow: `0 0 12px ${board.accent}88`,
          }}
        />

        {/* Title */}
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') { setTitleDraft(board.title); setIsEditingTitle(false); }
            }}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--accent-500)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: 700,
              outline: 'none',
              fontFamily: 'inherit',
              letterSpacing: '-0.3px',
              minWidth: '200px',
            }}
          />
        ) : (
          <button
            onClick={() => { setTitleDraft(board.title); setIsEditingTitle(true); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'text',
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: 700,
              padding: '6px 8px',
              borderRadius: '8px',
              letterSpacing: '-0.3px',
              transition: 'background 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--border-subtle)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            {board.title}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}

        {/* Card count summary */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          {board.columnIds.map((colId) => {
            const col = state.columns[colId];
            if (!col) return null;
            return (
              <span key={colId} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{col.cardIds.length}</span>{' '}
                {col.title}
              </span>
            );
          })}
        </div>
      </header>

      {/* ── Columns Area ── */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '20px 28px',
          overflowX: 'auto',
          overflowY: 'hidden',
          flex: 1,
          alignItems: 'flex-start',
        }}
      >
        {board.columnIds.map((columnId) => (
          <div key={columnId} className="animate-fade-in">
            <Column boardId={boardId} columnId={columnId} />
          </div>
        ))}

        {/* Add column */}
        {isAddingColumn ? (
          <div
            style={{
              width: '288px',
              minWidth: '288px',
              background: 'var(--bg-column)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '14px',
              flexShrink: 0,
            }}
            className="animate-fade-in"
          >
            <input
              autoFocus
              placeholder="Column title…"
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitColumn();
                if (e.key === 'Escape') { setIsAddingColumn(false); setNewColTitle(''); }
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--accent-500)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={submitColumn}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'var(--accent-500)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Add Column
              </button>
              <button
                onClick={() => { setIsAddingColumn(false); setNewColTitle(''); }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            id="add-column-btn"
            onClick={() => setIsAddingColumn(true)}
            style={{
              width: '288px',
              minWidth: '288px',
              height: '56px',
              borderRadius: '16px',
              border: '1px dashed var(--border-medium)',
              background: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-500)';
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-300)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Column
          </button>
        )}
      </div>
    </div>
  );
}
