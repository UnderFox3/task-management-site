'use client';

import { useRef, useState } from 'react';
import type { Card } from '@/lib/types';
import { useBoardContext } from '@/app/providers/BoardProvider';
import CardComponent from './Card';
import CardModal from './CardModal';

interface Props {
  boardId: string;
  columnId: string;
}

export default function Column({ boardId, columnId }: Props) {
  const { state, addCard, updateColumn, deleteColumn, moveCard } = useBoardContext();
  const column = state.columns[columnId];

  const [isEditingTitle, setIsEditingTitle]   = useState(false);
  const [titleDraft, setTitleDraft]           = useState(column?.title ?? '');
  const [isAddingCard, setIsAddingCard]       = useState(false);
  const [newCardTitle, setNewCardTitle]       = useState('');
  const [selectedCard, setSelectedCard]       = useState<Card | null>(null);
  const [isDragOver, setIsDragOver]           = useState(false);

  const dragCardRef = useRef<{ cardId: string; fromColumnId: string } | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  if (!column) return null;

  const cards = column.cardIds.map((id) => state.cards[id]).filter(Boolean) as Card[];

  // ── Title editing ──────────────────────────────────────────────────────────

  function saveTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed) updateColumn(columnId, trimmed);
    else setTitleDraft(column.title);
    setIsEditingTitle(false);
  }

  // ── Add Card ───────────────────────────────────────────────────────────────

  function submitCard() {
    if (newCardTitle.trim()) {
      addCard(columnId, newCardTitle.trim());
      setNewCardTitle('');
    }
    setIsAddingCard(false);
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  function handleCardDragStart(e: React.DragEvent, cardId: string) {
    dragCardRef.current = { cardId, fromColumnId: columnId };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, fromColumnId: columnId }));
    // slight visual delay so the ghost shows the card first
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  }

  function handleCardDragEnd(e: React.DragEvent) {
    (e.target as HTMLElement).style.opacity = '1';
    dragCardRef.current = null;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const { cardId, fromColumnId } = JSON.parse(e.dataTransfer.getData('text/plain'));
      // Drop at end of column
      moveCard(cardId, fromColumnId, columnId, cards.length);
    } catch {
      // ignore
    }
  }

  function handleCardDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    try {
      const { cardId, fromColumnId } = JSON.parse(e.dataTransfer.getData('text/plain'));
      moveCard(cardId, fromColumnId, columnId, targetIndex);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <div
        style={{
          width: '288px',
          minWidth: '288px',
          background: isDragOver ? 'rgba(124,58,237,0.06)' : 'var(--bg-column)',
          border: `1px solid ${isDragOver ? 'rgba(124,58,237,0.4)' : 'var(--border-subtle)'}`,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100dvh - 96px)',
          transition: 'background 0.15s ease, border-color 0.15s ease',
          flexShrink: 0,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ── Column Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 14px 10px',
            flexShrink: 0,
          }}
        >
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleDraft(column.title); setIsEditingTitle(false); } }}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--accent-500)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <button
              onClick={() => { setTitleDraft(column.title); setIsEditingTitle(true); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'text',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '4px 6px',
                borderRadius: '6px',
                flex: 1,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--border-subtle)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              {column.title}
              <span
                style={{
                  background: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  borderRadius: '12px',
                  padding: '1px 8px',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {cards.length}
              </span>
            </button>
          )}

          {/* Delete column */}
          <button
            onClick={() => deleteColumn(boardId, columnId)}
            title="Delete column"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              transition: 'color 0.15s, background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#ef4444';
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Cards List ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 10px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="animate-fade-in"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => handleCardDrop(e, index)}
            >
              <CardComponent
                card={card}
                columnId={columnId}
                onClick={() => setSelectedCard(card)}
                onDragStart={(e) => handleCardDragStart(e, card.id)}
                onDragEnd={handleCardDragEnd}
              />
            </div>
          ))}

          {/* Drop zone hint when dragging */}
          {isDragOver && cards.length === 0 && (
            <div
              style={{
                height: '60px',
                borderRadius: '10px',
                border: '2px dashed rgba(124,58,237,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              Drop here
            </div>
          )}
        </div>

        {/* ── Add Card ── */}
        <div style={{ padding: '6px 10px 10px', flexShrink: 0 }}>
          {isAddingCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                ref={addInputRef}
                autoFocus
                placeholder="Card title…"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCard();
                  if (e.key === 'Escape') { setIsAddingCard(false); setNewCardTitle(''); }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--accent-500)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={submitCard}
                  style={{
                    flex: 1,
                    padding: '7px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-500)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }}
                  style={{
                    flex: 1,
                    padding: '7px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '10px',
                border: '1px dashed var(--border-medium)',
                background: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add a card
            </button>
          )}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          columnId={columnId}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}
