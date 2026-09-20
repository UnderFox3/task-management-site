'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/app/providers/BoardProvider';

const ACCENT_COLOURS = [
  '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];

interface Props {
  onClose: () => void;
}

export default function NewBoardModal({ onClose }: Props) {
  const { addBoard } = useBoardContext();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [accent, setAccent] = useState(ACCENT_COLOURS[0]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const boardId = addBoard(title.trim(), accent, visibility);
    onClose();
    router.push(`/board/${boardId}`);
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
        zIndex: 200,
      }}
      className="animate-overlay-in"
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '20px',
          padding: '32px',
          width: '420px',
          maxWidth: '95vw',
          boxShadow: 'var(--shadow-modal)',
        }}
        className="animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Create New Board</h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Board Name
            </span>
            <input
              id="new-board-name"
              type="text"
              autoFocus
              placeholder="e.g. Product Roadmap"
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
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-500)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
            />
          </label>

          {/* Accent colour */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Accent Colour
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ACCENT_COLOURS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  onClick={() => setAccent(colour)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: colour,
                    border: accent === colour ? '3px solid #fff' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: accent === colour ? `3px solid ${colour}` : 'none',
                    outlineOffset: '2px',
                    transition: 'transform 0.15s ease',
                    transform: accent === colour ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Board Visibility
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['public', 'private'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: visibility === option ? '1px solid var(--accent-500)' : '1px solid var(--border-medium)',
                    background: visibility === option ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {option === 'public' ? 'Public' : 'Private'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid var(--border-medium)',
                background: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.15s ease',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: title.trim() ? `linear-gradient(135deg, var(--accent-600), var(--accent-400))` : 'var(--border-medium)',
                color: title.trim() ? '#fff' : 'var(--text-muted)',
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                boxShadow: title.trim() ? '0 4px 16px var(--accent-glow)' : 'none',
              }}
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
