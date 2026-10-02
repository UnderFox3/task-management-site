'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type VerifyState = 'pending' | 'success' | 'error' | 'no-token';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerifyState>(token ? 'pending' : 'no-token');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json() as { success: boolean; message: string };
        if (cancelled) return;
        if (data.success) {
          setState('success');
          setMessage(data.message || 'Email address has been successfully verified!');
        } else {
          setState('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch {
        if (cancelled) return;
        setState('error');
        setMessage('Something went wrong. Please try again later.');
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse at 50% 15%, rgba(124, 58, 237, 0.22), transparent 50%), var(--bg-base)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-modal)',
          padding: '36px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'modal-in 0.28s cubic-bezier(0.4, 0, 0.2, 1) both',
        }}
      >
        {/* Logo */}
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
            marginBottom: '20px',
            flexShrink: 0,
          }}
        >
          T
        </div>

        {state === 'pending' && <PendingState />}
        {state === 'success' && <SuccessState message={message} />}
        {state === 'error' && <ErrorState message={message} />}
        {state === 'no-token' && <NoTokenState />}
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <>
      <Spinner />
      <h1
        style={{
          margin: '16px 0 8px',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Verifying your email…
      </h1>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
        Please wait while we confirm your email address.
      </p>
    </>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <>
      <div style={iconWrapStyle('#22c55e', 'rgba(34,197,94,0.15)')}>✓</div>
      <h1
        style={{
          margin: '16px 0 8px',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Email verified!
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
        {message}
      </p>
      <Link
        href="/login"
        id="verify-go-to-login"
        style={{
          display: 'inline-block',
          padding: '11px 28px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        Go to sign in
      </Link>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <div style={iconWrapStyle('#ef4444', 'rgba(239,68,68,0.15)')}>✕</div>
      <h1
        style={{
          margin: '16px 0 8px',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Verification failed
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/login"
          id="verify-error-login"
          style={secondaryLinkStyle}
        >
          Sign in anyway
        </Link>
        <Link
          href="/signup"
          id="verify-error-signup"
          style={{
            display: 'inline-block',
            padding: '10px 22px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-600), var(--accent-400))',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          Create new account
        </Link>
      </div>
    </>
  );
}

function NoTokenState() {
  return (
    <>
      <div style={iconWrapStyle('#f59e0b', 'rgba(245,158,11,0.15)')}>!</div>
      <h1
        style={{
          margin: '16px 0 8px',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        No verification link
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
        This page requires a verification token from your email.
        Check your inbox and click the link in the verification email.
      </p>
      <Link
        href="/login"
        id="verify-no-token-login"
        style={secondaryLinkStyle}
      >
        Back to sign in
      </Link>
    </>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '3px solid var(--border-medium)',
        borderTopColor: 'var(--accent-400)',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────

function iconWrapStyle(color: string, bg: string): React.CSSProperties {
  return {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    border: `1.5px solid ${color}44`,
    color,
    fontSize: '22px',
    fontWeight: 800,
    flexShrink: 0,
  };
}

const secondaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 22px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-medium)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
};

// ─── Spinner keyframe injected once ────────────────────────────────────────

const SpinnerStyle = () => (
  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
);

// ─── Page export ───────────────────────────────────────────────────────────

export default function VerifyPage() {
  return (
    <>
      <SpinnerStyle />
      <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }} />}>
        <VerifyContent />
      </Suspense>
    </>
  );
}
