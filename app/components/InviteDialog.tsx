'use client';

import { useState } from 'react';
import { useBoardContext } from '@/app/providers/BoardProvider';

export default function InviteDialog({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const { inviteUserToBoard } = useBoardContext();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const result = await inviteUserToBoard(boardId, email, role);
    setMessage(result.message);
    setSubmitting(false);
    if (result.success) {
      setEmail('');
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2100, display: 'grid', placeItems: 'center', padding: 20, background: 'var(--bg-overlay)' }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        style={{ width: 'min(440px, 100%)', padding: 24, borderRadius: 18, border: '1px solid var(--border-medium)', background: 'var(--bg-modal)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 id="invite-dialog-title" style={{ margin: 0, fontSize: 20 }}>Invite to board</h2>
          <button type="button" onClick={onClose} aria-label="Close invite dialog" style={iconButtonStyle}>×</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
          We will email a secure invitation link that expires in 7 days.
        </p>
        <label style={fieldStyle}>
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus
            required
            style={inputStyle}
            placeholder="name@example.com"
          />
        </label>
        <label style={{ ...fieldStyle, marginTop: 14 }}>
          <span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as 'editor' | 'viewer')} style={inputStyle}>
            <option value="editor">Editor - can update board content</option>
            <option value="viewer">Viewer - read-only access</option>
          </select>
        </label>
        {message && <p role="status" style={{ color: '#fca5a5', fontSize: 13 }}>{message}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? 'Sending…' : 'Send invitation'}
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldStyle: React.CSSProperties = { display: 'grid', gap: 7, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-primary)', font: 'inherit' };
const iconButtonStyle: React.CSSProperties = { border: 0, background: 'transparent', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' };
const primaryButtonStyle: React.CSSProperties = { border: 0, borderRadius: 9, padding: '10px 14px', background: 'var(--accent-500)', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const secondaryButtonStyle: React.CSSProperties = { border: '1px solid var(--border-medium)', borderRadius: 9, padding: '10px 14px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' };
