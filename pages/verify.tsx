import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const VerifyPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (router.query.email && typeof router.query.email === 'string') {
      setEmail(router.query.email);
    }
  }, [router.query.email]);

  useEffect(() => {
    if (timeLeft > 0 && !success) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !success) {
      setError('Verification code has expired. Please sign up again.');
    }
  }, [timeLeft, success]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Email Verification - Resume Tailor</title>
        <meta name="description" content="Verify your email address to complete registration" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white">
          <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Verify Your Email</h2>
          
          {/* Countdown Timer */}
          {!success && timeLeft > 0 && (
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">Time remaining to verify:</div>
              <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <p className="text-green-700 font-semibold mb-4">Your email has been verified! You can now log in.</p>
              <a href="/home" className="text-green-800 font-bold underline">Go to Login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1 text-green-800" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  readOnly={!!router.query.email}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-green-800" htmlFor="code">Verification Code</label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-700 tracking-widest text-center"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  disabled={timeLeft === 0}
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading || timeLeft === 0}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyPage; 