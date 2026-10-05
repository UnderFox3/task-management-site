'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBoardContext } from '@/app/providers/BoardProvider';
import { Route } from 'next';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const { register, currentUser } = useBoardContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.replace(redirectTarget as Route);
    }
  }, [currentUser, router, redirectTarget]);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsSuccess(false);
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(email, username, password);
      setMessage(result.message);
      setIsSuccess(result.success);
      if (result.success) {
        setTimeout(() => {
          router.replace(redirectTarget as Route);
        }, 1200);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const loginLink = (`/login${redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`) as Route;

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
          <Link
            href={loginLink}
            id="tab-sign-in"
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
            Sign in
          </Link>
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
            Create account
          </div>
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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>Create account</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>
            Join iTask to create boards and organize your work.
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'grid', gap: '11px' }}>
          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Username</span>
            <input
              type="text"
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sarah"
              required
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email address</span>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              required
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</span>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Confirm password</span>
            <input
              type="password"
              id="signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
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
            id="signup-submit"
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
              marginTop: '4px',
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            href={loginLink}
            id="link-sign-in"
            style={{ color: 'var(--accent-400)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }} />}>
      <SignupForm />
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
