'use client';

import { useEffect, useRef, useState } from 'react';
import type { Card, Priority } from '@/lib/types';
import { useBoardContext } from '@/app/providers/BoardProvider';

interface Props {
  card: Card;
  columnId: string;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high',   label: 'High',   color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#ec4899' },
];

export default function CardModal({ card, columnId, onClose }: Props) {
  const { updateCard, deleteCard } = useBoardContext();

  const [title, setTitle]       = useState(card.title);
  const [description, setDesc]  = useState(card.description);
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [dueDate, setDueDate]   = useState(card.dueDate ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') save(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function save() {
    updateCard(card.id, {
      title: title.trim() || card.title,
      description,
      priority,
      dueDate: dueDate || null,
    });
    onClose();
  }

  function handleDelete() {
    deleteCard(columnId, card.id);
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
        zIndex: 100,
        padding: '16px',
      }}
      className="animate-overlay-in"
      onClick={save}
    >
      <div
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '20px',
          padding: '32px',
          width: '520px',
          maxWidth: '100%',
          maxHeight: '90dvh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
        }}
        className="animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingTop: '4px' }}>
            Edit Card
          </h2>
          <button
            onClick={save}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ── Title ── */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Title
          </label>
          <input
            id="card-title-input"
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        {/* ── Description ── */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Description
          </label>
          <textarea
            id="card-description-input"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
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

        {/* ── Priority + Due Date ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {/* Priority */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Priority
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
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

          {/* Due Date */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Due Date
            </label>
            <input
              id="card-due-date-input"
              type="date"
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

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Delete */}
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Are you sure?</span>
              <button
                onClick={handleDelete}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              id="delete-card-btn"
              onClick={() => setConfirmDelete(true)}
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
                (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
                (e.currentTarget as HTMLElement).style.color = '#ef4444';
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'none';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
              Delete Card
            </button>
          )}

          <button
            id="save-card-btn"
            onClick={save}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 4px 16px var(--accent-glow)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
