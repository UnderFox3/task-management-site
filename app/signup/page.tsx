'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBoardContext } from '@/app/providers/BoardProvider';

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
      router.replace(redirectTarget as any);
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
          router.replace(redirectTarget as any);
        }, 500);
      }
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
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em' }}>Create account</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Join iTask to create boards and organize your work.
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Username</span>
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

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email address</span>
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

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</span>
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

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Confirm password</span>
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
            id="signup-submit"
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
              marginTop: '4px',
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            href={(`/login${redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`) as any}
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
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
};
