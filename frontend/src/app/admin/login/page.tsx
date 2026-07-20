'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.bagsbro.io';

const ERROR_MESSAGES: Record<string, string> = {
  please_wait: 'TOO MANY ATTEMPTS. WAIT A MOMENT.',
  not_admin: 'THIS ACCOUNT IS NOT AUTHORIZED.',
  access_denied: 'AUTH DENIED.',
  invalid_state: 'INVALID SESSION STATE. TRY AGAIN.',
  code_already_used: 'LOGIN STEP ALREADY COMPLETED. START AGAIN.',
  invalid_grant: 'AUTH CODE EXPIRED. TRY AGAIN.',
  user_fetch_failed: 'COULD NOT FETCH TWITTER USER.',
};

function getErrorMessage(error: string | null) {
  if (!error) return null;
  if (error.startsWith('rate_limited_')) {
    const m = error.match(/(\d+)s/);
    return `X IS RATE LIMITING. WAIT ~${m?.[1] || '60'} SECONDS.`;
  }
  return ERROR_MESSAGES[error] || `AUTH FAILED: ${error.toUpperCase()}`;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const error = searchParams.get('error');
  const success = searchParams.get('success');
  const token = searchParams.get('token');
  const userParam = searchParams.get('user');

  useEffect(() => {
    // Handle callback with token
    if (success === 'true' && token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        window.location.href = '/admin/farmer';
        return;
      } catch (e) {
        console.error('Error processing auth callback:', e);
      }
    }

    // Check if already logged in
    const stored = localStorage.getItem('admin_token');
    if (stored) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.authenticated) {
            window.location.href = '/admin/farmer';
          } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setChecking(false);
          }
        })
        .catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [success, token, userParam]);

  if (checking) return null;

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${API}/auth/twitter/authorize-redirect`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{
        background: '#111',
        border: '2px solid #FF3366',
        padding: '40px',
        width: '360px',
        textAlign: 'center',
      }}>
        <div style={{ color: '#FF3366', fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>
          ⚠ ADMIN ACCESS ONLY
        </div>
        <div style={{ color: '#444', fontSize: 7, marginBottom: 32, letterSpacing: 1 }}>
          BAGS BRO FARMER DASHBOARD
        </div>

        {error && (
          <div style={{ color: '#FF3366', fontSize: 7, marginBottom: 20, lineHeight: 2 }}>
            {getErrorMessage(error)}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            background: '#000',
            border: '2px solid #1DA1F2',
            color: isLoading ? '#555' : '#1DA1F2',
            padding: '14px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            letterSpacing: 1,
            boxSizing: 'border-box',
          }}
        >
          𝕏  {isLoading ? 'CONNECTING...' : 'SIGN IN WITH TWITTER'}
        </button>

        <div style={{ color: '#333', fontSize: 6, marginTop: 20 }}>
          @BAGSBROMUSIC ACCOUNT ONLY
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
