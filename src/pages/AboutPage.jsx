import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Code, 
  Layers, 
  Server, 
  Cloud, 
  Shield, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  ArrowRight 
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getSiteSettings } from '../lib/api.js';

export default function AboutPage() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    getSiteSettings('general').then((data) => setSettings(data || {}));
  }, []);

  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Intro Hero */}
        <div className="rounded-3xl border p-6 sm:p-10 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <img
            src={settings.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={settings.author_name || 'Mr. Soth'}
            className="w-32 h-32 rounded-3xl object-cover shadow-lg border-2 border-blue-500/20 shrink-0"
          />
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Terminal className="w-3.5 h-3.5" /> Full-Stack Engineer & Writer
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Hi, I'm {settings.author_name || 'Mr. Soth'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {settings.author_bio || 'A personal technology blog. I write articles about web development, coding, and real problems from my work.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Link
                to="/contact"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Get in Touch
              </Link>
              <Link
                to="/cv"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                View CV <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Why I Started This Blog */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Why I Write This Blog
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            In everyday software engineering, we often spend hours troubleshooting enigmatic stack traces, database deadlocks, edge latency bottlenecks, and unexpected framework nuances. StackOverflow and documentation are useful, but practical, battle-tested solutions to specific architectural problems are rare.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            This site is my open notebook. Every post is written from practical experience—documenting why a bug happened, how we identified the root cause, and how to prevent it permanently in production.
          </p>
        </div>

        {/* Tech Stack Behind This Site */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            The Tech Stack Behind Mr.Soth Blog
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-600 dark:text-blue-400 uppercase font-mono">
                <Code className="w-4 h-4" /> Frontend
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                React 18 + Vite with Tailwind CSS. Styled cleanly without CSS specificity conflicts using semantic theme tokens and accessible components.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                <Server className="w-4 h-4" /> Database & RLS
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Supabase PostgreSQL with Row Level Security (RLS) on every table. Complete separation between public and admin privileges.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-600 dark:text-amber-400 uppercase font-mono">
                <Cloud className="w-4 h-4" /> Storage & Media
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Cloudflare R2 object storage with zero egress fees for image assets, cover art, and CV document distribution.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-purple-600 dark:text-purple-400 uppercase font-mono">
                <Shield className="w-4 h-4" /> Security & Edge
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Cloudflare Worker hosting serving fast edge HTML and proxying token-authenticated admin file uploads securely.
              </p>
            </div>
          </div>
        </div>

        {/* Social Connect */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Let's Connect & Collaborate</h3>
            <p className="text-xs text-blue-100">
              Have questions about an article or interested in engineering consulting?
            </p>
          </div>

          <div className="flex items-center gap-3">
            {settings.github_url && (
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {settings.linkedin_url && (
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {settings.twitter_url && (
              <a
                href={settings.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            <Link
              to="/contact"
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              Contact Me
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}
