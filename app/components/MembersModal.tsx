'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BoardAccessRole } from '@/lib/types';
import { useBoardContext } from '@/app/providers/BoardProvider';

interface Member {
  userId: string;
  email: string;
  username: string;
  role: BoardAccessRole;
}

interface Invitation {
  email: string;
  role: 'editor' | 'viewer';
  expires_at: string;
}

interface MembersResponse {
  members?: Member[];
  invitations?: Invitation[];
  message?: string;
}

export default function MembersModal({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const { refreshState } = useBoardContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/board/members?boardId=${encodeURIComponent(boardId)}`);
      const data = await response.json() as MembersResponse;
      if (!response.ok) throw new Error(data.message ?? 'Unable to load members.');
      setMembers(data.members ?? []);
      setInvitations(data.invitations ?? []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load members.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function runAction(url: string, method: string, body: Record<string, string>, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) return false;
    setError('');
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? 'The action could not be completed.');
      await refreshState();
      await load();
      return true;
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'The action could not be completed.';
      await load();
      setError(message);
      return false;
    }
  }

  function transferOwnership(member: Member) {
    if (!window.confirm(`Transfer ownership to ${member.username}? You will become an editor.`)) return;
    setError('');
    void (async () => {
      try {
        const response = await fetch('/api/board/transfer-ownership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardId, userId: member.userId }),
        });
        const result = await response.json() as { message?: string };
        if (!response.ok) throw new Error(result.message ?? 'Unable to transfer ownership.');
        await refreshState();
        onClose();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'Unable to transfer ownership.');
      }
    })();
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2050, display: 'grid', placeItems: 'center', padding: 20, background: 'var(--bg-overlay)' }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="members-dialog-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: 'min(680px, 100%)', maxHeight: 'min(760px, calc(100dvh - 40px))', overflowY: 'auto', padding: 24, borderRadius: 18, border: '1px solid var(--border-medium)', background: 'var(--bg-modal)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div>
            <h2 id="members-dialog-title" style={{ margin: 0, fontSize: 20 }}>Manage members</h2>
            <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Change access, transfer ownership, or revoke invitations.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close members dialog" style={iconButtonStyle}>×</button>
        </div>

        {error && <p role="alert" style={{ color: '#fca5a5', fontSize: 13 }}>{error}</p>}
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading members…</p> : (
          <>
            <h3 style={sectionHeadingStyle}>Members ({members.length})</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {members.map((member) => (
                <div key={member.userId} style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{member.username}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{member.email}</div>
                  </div>
                  {member.role === 'owner' ? (
                    <span style={roleLabelStyle}>Owner</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <select
                        aria-label={`Role for ${member.username}`}
                        value={member.role}
                        onChange={(event) => void runAction('/api/board/member-role', 'PATCH', {
                          boardId,
                          userId: member.userId,
                          role: event.target.value,
                        })}
                        style={selectStyle}
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button type="button" onClick={() => transferOwnership(member)} style={textButtonStyle}>Transfer ownership</button>
                      <button
                        type="button"
                        onClick={() => void runAction(
                          `/api/board/member?boardId=${encodeURIComponent(boardId)}&userId=${encodeURIComponent(member.userId)}`,
                          'DELETE',
                          {},
                          `Remove ${member.username} from this board?`,
                        )}
                        style={{ ...textButtonStyle, color: '#f87171' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h3 style={{ ...sectionHeadingStyle, marginTop: 24 }}>Pending invitations ({invitations.length})</h3>
            {invitations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No pending invitations.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {invitations.map((invitation) => (
                  <div key={invitation.email} style={rowStyle}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{invitation.email}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {invitation.role} · expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => void runAction('/api/board/invitations', 'PATCH', {
                          boardId,
                          email: invitation.email,
                          role: invitation.role,
                        })}
                        style={textButtonStyle}
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAction('/api/board/invitations', 'DELETE', {
                          boardId,
                          email: invitation.email,
                        }, `Revoke the invitation sent to ${invitation.email}?`)}
                        style={{ ...textButtonStyle, color: '#f87171' }}
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Done</button>
        </div>
      </section>
    </div>
  );
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' };
const selectStyle: React.CSSProperties = { padding: '7px 9px', borderRadius: 8, border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-primary)' };
const roleLabelStyle: React.CSSProperties = { color: 'var(--accent-300)', fontSize: 13, fontWeight: 700, padding: '6px 10px', borderRadius: 999, background: 'rgba(124,58,237,.14)' };
const sectionHeadingStyle: React.CSSProperties = { margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em' };
const textButtonStyle: React.CSSProperties = { border: 0, background: 'transparent', color: 'var(--accent-300)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '6px 3px' };
const iconButtonStyle: React.CSSProperties = { border: 0, background: 'transparent', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' };
const secondaryButtonStyle: React.CSSProperties = { border: '1px solid var(--border-medium)', borderRadius: 9, padding: '9px 14px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' };
