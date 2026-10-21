import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext.jsx';

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-main)]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-main)]">
        <div className="w-full max-w-lg rounded-3xl border p-8 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Administrator Privileges Required
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are signed in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user.email}</span>, but your account does not have <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600">is_admin = true</code> in the profiles table.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
              How to grant admin access in Supabase:
            </span>
            <pre className="text-[11px] font-mono p-3 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto">
{`UPDATE public.profiles
SET is_admin = true
WHERE email = '${user.email}';`}
            </pre>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Blog
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
