import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Shield, LogIn, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setSubmitting(true);
    try {
      await signIn('admin@mrsoth.dev', 'demo-password');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-main)]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand & Back link */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Terminal className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mr.Soth Admin
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with your Supabase administrator credentials.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {!isConfigured && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Supabase Not Yet Connected</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                You can use the instant Demo Admin login below to explore all administration features, post editors, and ad controls in preview mode.
              </p>
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" /> Sign in as Admin Demo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mrsoth.dev"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
            <p>Protected by Supabase Auth and Row Level Security.</p>
            <p className="font-mono text-[10px]">Only users with is_admin = true are authorized.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
