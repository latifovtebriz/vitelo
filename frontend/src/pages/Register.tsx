import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { logger } from '../lib/logger';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, Clock, Sparkles, Check, X } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both password fields are identical.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    logger.action('Register', 'Submitted registration form', { email, fullName });

    try {
      const res = await api.post('/auth/register', { full_name: fullName, email, password });
      setPendingConfirmation(true);
      if (res.data.verification_link) {
        setVerificationLink(res.data.verification_link);
      }
    } catch (err: any) {
      logger.error('Register', 'Registration error', err);
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.post('/auth/resend-verification', { email, password, full_name: fullName });
      if (res.data.verification_link) {
        setVerificationLink(res.data.verification_link);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Resend failed.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        
        {/* ── State 1: Check Email Confirmation Screen ── */}
        {pendingConfirmation ? (
          <div className="text-center py-4 space-y-6">
            <div className="relative mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
              <Mail className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Check your email</h2>
              <p className="mt-2 text-sm text-slate-600">
                We've sent a 15-minute confirmation link to:
              </p>
              <div className="mt-1 font-semibold text-blue-700 bg-blue-50 py-1.5 px-3 rounded-lg inline-block border border-blue-100 text-sm">
                {email}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2 text-left">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Click the confirmation link to activate your account and complete registration.</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>The link is valid for <strong>15 minutes</strong> for your security.</span>
              </div>
            </div>

            {/* Direct Verification Shortcut for Quick Testing */}
            {verificationLink && (
              <div className="pt-2">
                <a
                  href={verificationLink}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Confirm & Activate Account Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-medium text-emerald-700">
                A fresh confirmation link was sent to your email!
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending Link...' : 'Didn’t receive it? Resend Link'}
              </button>

              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ── State 2: Registration Input Form ── */
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
              <p className="mt-2 text-sm text-slate-600">Start building your optimal ATS resume for free.</p>
            </div>
            
            <form className="mt-8 space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tabriz Latifov"
                    className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    {passwordsMatch && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter your password"
                    className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                      passwordsMismatch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : passwordsMatch
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                    }`}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all mt-2"
              >
                {loading ? 'Sending confirmation link...' : 'Create Account (15m Verify Link)'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Log in
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
