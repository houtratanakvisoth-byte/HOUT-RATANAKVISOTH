import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Heart, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { getSiteSettings, subscribeNewsletter } from '../lib/api.js';
import AdSlot from './AdSlot.jsx';

export default function Footer() {
  const [settings, setSettings] = useState({});
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    let mounted = true;
    getSiteSettings('general')
      .then((data) => {
        if (mounted) setSettings(data || {});
      })
      .catch((err) => console.warn('Could not load site settings for footer:', err));

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
        setSubStatus({ state: 'success', message: 'Subscribed successfully!' });
        setEmail('');
      }
    } catch (err) {
      setSubStatus({ state: 'error', message: err.message || 'Subscription failed.' });
    }
  };

  return (
    <footer className="w-full border-t mt-16 transition-colors bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
      
      {/* Footer Advertisement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdSlot slot="footer" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {settings.site_title || 'Mr.Soth Blog'}
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {settings.tagline || 'A personal technology blog focusing on web development, coding patterns, and real engineering challenges.'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500 dark:text-slate-400">
              {settings.github_url && (
                <a
                  href={settings.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
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
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                  className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              <Link
                to="/contact"
                aria-label="Contact Mr. Soth"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cv" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Curriculum Vitae
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About the Author
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Newsletter in Footer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Stay in Touch
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Get notified whenever a new technical article or deep dive is published.
            </p>
            {subStatus.state === 'success' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{subStatus.message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-1.5 pt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={subStatus.state === 'loading'}
                  className="w-full flex items-center justify-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {subStatus.state === 'loading' ? 'Joining...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <p>
            © {new Date().getFullYear()} Mr. Soth. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 inline fill-red-500" />
            <span>using React, Supabase & Cloudflare</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
