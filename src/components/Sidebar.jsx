import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Tag as TagIcon, 
  Folder, 
  Send, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getCategories, getTags, getSiteSettings, subscribeNewsletter } from '../lib/api.js';
import AdSlot from './AdSlot.jsx';

export default function Sidebar({ className = '' }) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [settings, setSettings] = useState({});
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getCategories(),
      getTags(),
      getSiteSettings('general')
    ]).then(([catData, tagData, siteData]) => {
      if (mounted) {
        setCategories(catData || []);
        setTags(tagData || []);
        setSettings(siteData || {});
      }
    }).catch((err) => console.warn('Sidebar data load error:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubStatus({ state: 'loading', message: '' });
    try {
      const res = await subscribeNewsletter(email.trim());
      if (res.message) {
        setSubStatus({ state: 'info', message: res.message });
      } else {
        setSubStatus({ state: 'success', message: 'Thanks for subscribing! Check your inbox.' });
        setEmail('');
      }
    } catch (err) {
      setSubStatus({ state: 'error', message: err.message || 'Subscription failed.' });
    }
  };

  return (
    <aside className={`w-full space-y-6 ${className}`}>
      
      {/* 1. Author Profile Card */}
      <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4 mb-3">
          <img
            src={settings.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={settings.author_name || 'Mr. Soth'}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/20"
          />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {settings.author_name || 'Mr. Soth'}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {settings.author_title || 'Senior Software Engineer'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {settings.author_bio || 'A personal technology blog. I write articles about web development, coding, and real problems from my work.'}
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {settings.github_url && (
            <a
              href={settings.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {settings.linkedin_url && (
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {settings.twitter_url && (
            <a
              href={settings.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="p-2 rounded-lg text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          <Link
            to="/contact"
            aria-label="Contact Mr. Soth"
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
          </Link>
          <Link
            to="/cv"
            className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View CV <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Top Sidebar Advertisement Slot */}
      <AdSlot slot="sidebar_top" />

      {/* 3. Newsletter Subscription Widget */}
      <div className="rounded-2xl border p-5 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Engineering Dispatch</h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          Join readers receiving practical writeups on React, PostgreSQL, and web performance. No spam.
        </p>

        {subStatus.state === 'success' ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{subStatus.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={subStatus.state === 'loading'}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {subStatus.state === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            {subStatus.message && subStatus.state !== 'success' && (
              <p className={`text-[11px] ${subStatus.state === 'info' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                {subStatus.message}
              </p>
            )}
          </form>
        )}
      </div>

      {/* 4. Categories Navigation */}
      <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5" />
          Categories
        </h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-500">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Tag Cloud */}
      {tags.length > 0 && (
        <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <TagIcon className="w-3.5 h-3.5" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. Bottom Sidebar Advertisement Slot */}
      <AdSlot slot="sidebar_bottom" />

    </aside>
  );
}
