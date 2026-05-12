'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'sign-in' | 'register' | 'reset';
type AuthMethod = 'email' | 'phone';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'input' | 'verify'>('input');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data?.user) router.push('/'); })
      .catch(() => null);
  }, [router]);

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    setDebugOtp('');

    if (!identifier.trim()) {
      setError(`Enter your ${method === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Enter your name.');
      return;
    }

    if (mode === 'register' && (!password || password.length < 8)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          method,
          identifier: identifier.trim(),
          name: mode === 'register' ? name.trim() : undefined,
          password: password.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Request failed.');
      } else {
        setStage('verify');
        setSuccess(data?.message || 'Code sent.');
        if (data?.debugOtp) setDebugOtp(data.debugOtp);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    if (!otp.trim()) {
      setError('Enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          method,
          identifier: identifier.trim(),
          otp: otp.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Verification failed.');
      } else {
        setSuccess('Signed in successfully. Redirecting...');
        setTimeout(() => router.push('/'), 1500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIdentifier('');
    setName('');
    setPassword('');
    setOtp('');
    setStage('input');
    setError('');
    setSuccess('');
    setDebugOtp('');
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetForm();
  };

  return (
    <div className="auth-full-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-brand">
            <div className="brand-icon">💊</div>
            <h1>Peerzada Medicate</h1>
            <p className="brand-subtitle">Professional Medical Store Management</p>
          </div>

          <div className="auth-mode-tabs">
            {(['sign-in', 'register', 'reset'] as AuthMode[]).map(m => (
              <button
                key={m}
                type="button"
                className={`mode-tab ${mode === m ? 'active' : ''}`}
                onClick={() => switchMode(m)}
              >
                {m === 'sign-in' ? 'Sign In' : m === 'register' ? 'Register' : 'Recover'}
              </button>
            ))}
          </div>

          <div className="auth-form-section">
            {stage === 'input' && (
              <>
                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{method === 'email' ? 'Email Address' : 'Phone Number'}</label>
                  <div className="input-with-selector">
                    <input
                      type={method === 'email' ? 'email' : 'tel'}
                      placeholder={method === 'email' ? 'you@domain.com' : '9876543210'}
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className="form-input"
                    />
                    <select
                      value={method}
                      onChange={e => { setMethod(e.target.value as AuthMethod); setIdentifier(''); }}
                      className="form-select"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="form-input"
                      required
                    />
                    <p className="form-hint">Minimum 8 characters for account security.</p>
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </>
            )}

            {stage === 'verify' && (
              <>
                <p className="verify-text">
                  Enter the verification code sent to your {method}.
                </p>

                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-input form-input-code"
                    maxLength={6}
                  />
                  <p className="form-hint">Expires in 5 minutes</p>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  onClick={resetForm}
                  type="button"
                  className="btn btn-ghost btn-lg"
                >
                  ← Back
                </button>
              </>
            )}

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {debugOtp && <div className="alert alert-info">Debug: <strong>{debugOtp}</strong></div>}
          </div>

          <div className="auth-footer">
            <p>© 2026 Peerzada Medicate • Sopore</p>
          </div>
        </div>
      </div>
    </div>
  );
}
