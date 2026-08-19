import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../lib/logger';
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided in link.');
      return;
    }

    const verify = async () => {
      try {
        logger.action('VerifyEmail', 'Verifying email confirmation token');
        const res = await api.post('/auth/verify-email', { token });
        
        // Setup Authorization Header & get profile
        api.defaults.headers.Authorization = `Bearer ${res.data.access_token}`;
        const userRes = await api.get('/auth/me');
        setAuth(userRes.data, res.data.access_token);
        
        setStatus('success');
        logger.action('VerifyEmail', 'Email verified and user logged in successfully', { email: userRes.data.email });

        // Auto-redirect to dashboard after 2.5s
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } catch (err: any) {
        logger.error('VerifyEmail', 'Email verification failed', err);
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message ||
          'Verification link has expired or is invalid. Links remain active for 15 minutes.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100 text-center">
        
        {/* State 1: Verifying Spinner */}
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Confirming your email...</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Please wait while we verify your 15-minute token and activate your Vitelo account.
            </p>
          </div>
        )}

        {/* State 2: Success Checkmark */}
        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified Successfully!</h2>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              Your account has been activated and you are now securely logged in.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Redirecting automatically in 2 seconds...</p>
          </div>
        )}

        {/* State 3: Error Warning */}
        {status === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Link Expired</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-4 space-y-2">
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Request a New Link (Sign Up)
              </Link>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Back to Log In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
