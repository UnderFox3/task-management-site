'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBoardContext } from '@/app/providers/BoardProvider';
import { Route } from 'next';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const { login, currentUser } = useBoardContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to intended target
  useEffect(() => {
    if (currentUser) {
      router.replace(redirectTarget as Route);
    }
  }, [currentUser, router, redirectTarget]);

  async function handleLogin(targetEmail = email, targetPassword = password) {
    setMessage(null);
    setIsSubmitting(true);
    try {
      const result = await login(targetEmail, targetPassword);
      setMessage(result.message);
      setIsSuccess(result.success);
      if (result.success) {
        setTimeout(() => {
          router.replace(redirectTarget as Route);
        }, 400);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleQuickLogin(accountEmail: string) {
    setEmail(accountEmail);
    setPassword('Admin@123');
    handleLogin(accountEmail, 'Admin@123');
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(124, 58, 237, 0.22), transparent 45%), var(--bg-base)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-modal)',
          padding: '36px 32px',
        }}
      >
        {/* Logo & Header */}
        <div style={{ marginBottom: '26px', textAlign: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '26px',
              fontWeight: 800,
              boxShadow: '0 0 24px var(--accent-glow)',
              marginBottom: '16px',
            }}
          >
            T
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em' }}>Welcome back</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Sign in to access your boards and collaborate with your team.
          </p>
        </div>

        {/* Quick Demo Accounts */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚡ Quick Demo Switcher</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              id="quick-login-admin"
              onClick={() => handleQuickLogin('admin@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="admin@itask.local (Board creator/Admin)"
            >
              <span style={{ fontSize: '14px' }}>👑</span>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Admin</span>
            </button>
            <button
              type="button"
              id="quick-login-jane"
              onClick={() => handleQuickLogin('jane@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="jane@itask.local (Non-admin member)"
            >
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Jane</span>
            </button>
            <button
              type="button"
              id="quick-login-alex"
              onClick={() => handleQuickLogin('alex@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="alex@itask.local (Guest / viewer)"
            >
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>Alex</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or with credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{ display: 'grid', gap: '18px' }}
        >
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email address</span>
            <input
              type="email"
              id="login-email"
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
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              style={inputStyles}
            />
          </label>

          {message && (
            <div
              style={{
                borderRadius: '12px',
                padding: '11px 14px',
                background: isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: isSuccess ? '#4ade80' : '#f87171',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            id="login-submit"
            disabled={isSubmitting}
            style={{
              border: 'none',
              borderRadius: '12px',
              padding: '13px 18px',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href={(`/signup${redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`) as Route}
            style={{ color: 'var(--accent-400)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }} />}>
      <LoginForm />
    </Suspense>
  );
}

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
};

const quickBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: '10px 8px',
  borderRadius: '12px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-subtle)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
