'use client';

import { useState } from 'react';
import { useBoardContext } from '@/app/providers/BoardProvider';

export default function AuthScreen() {
  const { login, register, currentUser } = useBoardContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        setMessage(result.message);
        if (!result.success) return;
        return;
      }

      const result = await register(email, username, password);
      setMessage(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 30%), var(--bg-base)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-modal)',
          padding: '32px 28px',
        }}
      >
        <div style={{ marginBottom: '22px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            T
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.04em' }}>iTask</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
            Secure board collaboration with role-based access control.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px' }}>
          {(['login', 'register'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: mode === value ? 'var(--accent-500)' : 'transparent',
                color: mode === value ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {value === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {mode === 'register' && (
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sarah"
                required
                style={inputStyles}
              />
            </label>
          )}

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'}
              required
              minLength={8}
              style={inputStyles}
            />
          </label>

          {message && (
            <div
              style={{
                borderRadius: '10px',
                padding: '10px 12px',
                background: message.toLowerCase().includes('success') ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)',
                color: message.toLowerCase().includes('success') ? '#22c55e' : '#fca5a5',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              border: 'none',
              borderRadius: '12px',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
            }}
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '18px', color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
          Demo credentials: admin@itask.local / Admin@123
        </div>
      </div>
    </div>
  );
}

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '10px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
};
