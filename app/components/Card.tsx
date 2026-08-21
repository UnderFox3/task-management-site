'use client';

import type { Card as CardType } from '@/lib/types';

interface Props {
  card: CardType;
  columnId: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  medium: { label: 'Medium', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  high:   { label: 'High',   bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  urgent: { label: 'Urgent', bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export default function Card({ card, onClick, onDragStart, onDragEnd }: Props) {
  const priority = PRIORITY_CONFIG[card.priority];
  const overdue = isOverdue(card.dueDate);
  const formatted = formatDate(card.dueDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px',
        cursor: 'grab',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--bg-card-hover)';
        el.style.borderColor = 'var(--border-medium)';
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = 'var(--shadow-card)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--bg-card)';
        el.style.borderColor = 'var(--border-subtle)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Priority badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          borderRadius: '20px',
          background: priority.bg,
          color: priority.color,
          fontSize: '11px',
          fontWeight: 600,
          marginBottom: '10px',
          letterSpacing: '0.02em',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: priority.color,
          }}
        />
        {priority.label}
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          marginBottom: card.description || card.dueDate ? '10px' : '0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {card.title}
      </p>

      {/* Description snippet */}
      {card.description && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.description}
        </p>
      )}

      {/* Footer */}
      {formatted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: overdue ? '#ef4444' : 'var(--text-muted)',
            marginTop: '2px',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatted}
          {overdue && (
            <span
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#ef4444',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              Overdue
            </span>
          )}
        </div>
      )}
    </div>
  );
}
