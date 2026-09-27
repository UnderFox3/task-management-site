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

  const signupLink = (`/signup${redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`) as Route;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 15%, rgba(124, 58, 237, 0.22), transparent 50%), var(--bg-base)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-modal)',
          padding: '24px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation Tabs between Sign In & Create Account */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '18px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              padding: '7px 0',
              textAlign: 'center',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-500))',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
            }}
          >
            Sign in
          </div>
          <Link
            href={signupLink}
            id="tab-create-account"
            style={{
              padding: '7px 0',
              textAlign: 'center',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create account
          </Link>
        </div>

        {/* Logo & Header */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '22px',
              fontWeight: 800,
              boxShadow: '0 0 20px var(--accent-glow)',
              marginBottom: '10px',
            }}
          >
            T
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>
            Sign in to access your boards and collaborate with your team.
          </p>
        </div>

        {/* Quick Demo Accounts */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚡ Quick Demo Switcher</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              id="quick-login-admin"
              onClick={() => handleQuickLogin('admin@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="admin@itask.local (Board creator/Admin)"
            >
              <span style={{ fontSize: '13px' }}>👑</span>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Admin</span>
            </button>
            <button
              type="button"
              id="quick-login-jane"
              onClick={() => handleQuickLogin('jane@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="jane@itask.local (Non-admin member)"
            >
              <span style={{ fontSize: '13px' }}>👤</span>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Jane</span>
            </button>
            <button
              type="button"
              id="quick-login-alex"
              onClick={() => handleQuickLogin('alex@itask.local')}
              disabled={isSubmitting}
              style={quickBtnStyle}
              title="alex@itask.local (Guest / viewer)"
            >
              <span style={{ fontSize: '13px' }}>👤</span>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Alex</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>or with credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{ display: 'grid', gap: '12px' }}
        >
          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email address</span>
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

          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</span>
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
                borderRadius: '10px',
                padding: '9px 12px',
                background: isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: isSuccess ? '#4ade80' : '#f87171',
                fontSize: '12px',
                lineHeight: 1.4,
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
              padding: '11px 16px',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              marginTop: '4px',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href={signupLink}
            id="link-create-account"
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
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const quickBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  padding: '8px 6px',
  borderRadius: '10px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-subtle)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
