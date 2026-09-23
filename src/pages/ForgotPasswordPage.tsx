import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Password Reset Error:', err);
      const authError = err as { code?: string; message?: string };

      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-email') {
        // Prevent user enumeration leaks by showing success message anyway
        setSubmitted(true);
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many reset attempts. Please wait a few minutes before trying again.');
      } else {
        setError('Unable to send password reset email. Please verify your address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-600">
            Enter your registered email address and we will send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-xl text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Password Reset Email Sent</span>
            </div>
            <p className="leading-relaxed">
              If an account is associated with <strong>{email}</strong>, you will receive an email shortly with instructions to reset your password.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.in"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
              <Link to="/login" className="inline-flex items-center gap-1 text-slate-600 hover:text-sky-600">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
