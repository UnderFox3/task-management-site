'use client';

import { useEffect, useRef, useState } from 'react';
import type { Card, Priority } from '@/lib/types';
import { useBoardContext } from '@/app/providers/BoardProvider';
import Column from './Column';
import CardModal from './CardModal';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#ec4899' },
];

function toIsoDateTime(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function CreateCardModal({ columnId, onClose }: { columnId: string; onClose: () => void }) {
  const { addCard, updateCard } = useBoardContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const createdCardId = addCard(columnId, trimmed);
    updateCard(createdCardId, {
      description: description.trim(),
      priority,
      dueDate: toIsoDateTime(dueDate),
      completed,
    });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '96px 24px 24px',
        overflowY: 'auto',
      }}
      className="animate-overlay-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create card"
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          padding: '28px 28px 24px',
          width: 'min(760px, calc(100vw - 32px))',
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 120px)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          zIndex: 1,
          margin: 'auto',
        }}
        className="animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingTop: '4px', margin: 0 }}>
            Create Card
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Title
          </label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) submit();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Add a task title…"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: 500,
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-500)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '8px 0' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Completion
          </label>
          <button
            type="button"
            onClick={() => setCompleted((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border-medium)',
              background: completed ? 'rgba(34,197,94,0.14)' : 'transparent',
              color: completed ? '#22c55e' : 'var(--text-secondary)',
              borderRadius: '999px',
              padding: '7px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: completed ? '#22c55e' : 'transparent',
                border: completed ? '1px solid transparent' : '1px solid var(--border-medium)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
              }}
            >
              {completed ? '✓' : ''}
            </span>
            {completed ? 'Done' : 'Not done'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Add more details…"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-500)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '18px', marginBottom: '28px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Priority
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${priority === p.value ? p.color + '88' : 'var(--border-subtle)'}`,
                    background: priority === p.value ? p.color + '18' : 'transparent',
                    color: priority === p.value ? p.color : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: priority === p.value ? 600 : 400,
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                colorScheme: 'dark',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-500)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '7px 12px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: title.trim() ? 'linear-gradient(135deg, var(--accent-600), var(--accent-400))' : 'rgba(124,58,237,0.3)',
              color: '#fff',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 4px 16px var(--accent-glow)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (title.trim()) (e.currentTarget as HTMLElement).style.opacity = '0.88';
            }}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Create Card
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  boardId: string;
}

export default function BoardView({ boardId }: Props) {
  const { state, addColumn, updateBoard, moveColumn, inviteUserToBoard, currentUser, canManageBoard } = useBoardContext();
  const board = state.boards[boardId];

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]         = useState(board?.title ?? '');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle]       = useState('');
  const [selectedCard, setSelectedCard]     = useState<{ card: Card; columnId: string } | null>(null);
  const [createCardState, setCreateCardState] = useState<{ columnId: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

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

  function handleColumnDragStart(e: React.DragEvent, columnId: string) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-task-column', JSON.stringify({ type: 'column', columnId }));
  }

  function handleColumnDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const payload = e.dataTransfer.getData('application/x-task-column');
      if (!payload) return;
      const data = JSON.parse(payload) as { type?: string; columnId?: string };
      if (data.type !== 'column' || !data.columnId) return;
      if (data.columnId !== board.columnIds[targetIndex]) {
        moveColumn(boardId, data.columnId, targetIndex);
      }
    } catch {
      // ignore malformed drag payloads
    }
  }

  function openCard(card: Card) {
    const matchingColumnId = board.columnIds.find((columnId) => state.columns[columnId]?.cardIds.includes(card.id));
    if (!matchingColumnId) return;
    setCreateCardState(null);
    setSelectedCard({ card, columnId: matchingColumnId });
  }

  function openCreateCard(columnId: string) {
    setSelectedCard(null);
    setCreateCardState({ columnId });
  }

  function closeCreateCard() {
    setCreateCardState(null);
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-medium)', borderRadius: '999px', padding: '6px 10px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <span style={{ width: '8px', height: '8px', background: board.visibility === 'public' ? '#22c55e' : '#f59e0b', borderRadius: '50%' }} />
            {board.visibility === 'public' ? 'Public' : 'Private'}
          </div>
        </div>
      </header>

      {canManageBoard(boardId, 'owner') && board.visibility === 'private' && (
        <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '14px 28px 18px', background: 'var(--bg-base)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Invite by email"
              style={{ flex: '1 1 220px', minWidth: 180, padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
              style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const result = inviteUserToBoard(boardId, inviteEmail, inviteRole);
                setInviteMessage(result.message);
                if (result.success) setInviteEmail('');
              }}
              style={{ padding: '9px 14px', borderRadius: '10px', border: 'none', background: 'var(--accent-500)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Invite
            </button>
          </div>
          {inviteMessage && <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>{inviteMessage}</div>}
        </div>
      )}

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
        {board.columnIds.map((columnId, index) => (
          <div key={columnId} className="animate-fade-in">
            <Column
              boardId={boardId}
              columnId={columnId}
              index={index}
              onOpenCard={openCard}
              onOpenCreate={openCreateCard}
              onDragStartColumn={handleColumnDragStart}
              onDropColumn={handleColumnDrop}
            />
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

      {createCardState && (
        <CreateCardModal
          columnId={createCardState.columnId}
          onClose={closeCreateCard}
        />
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          columnId={selectedCard.columnId}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
