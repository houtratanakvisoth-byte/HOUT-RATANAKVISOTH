import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PenSquare, 
  FolderTree, 
  MessageSquare, 
  Megaphone, 
  Image as ImageIcon, 
  FileBadge, 
  Mail, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext.jsx';
import { getAdminDashboardStats } from '../../lib/api.js';

export default function AdminLayout({ children }) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ pendingComments: 0, unreadMessages: 0 });
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    getAdminDashboardStats()
      .then((data) => {
        if (data) {
          setStats({
            pendingComments: data.pendingComments || 0,
            unreadMessages: data.unreadMessages || 0,
          });
        }
      })
      .catch((err) => console.warn('Could not load stats for sidebar badges:', err));
  }, [location.pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('mrsoth_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'All Posts', path: '/admin/posts', icon: FileText },
    { label: 'New Post', path: '/admin/posts/new', icon: PenSquare },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { 
      label: 'Comments', 
      path: '/admin/comments', 
      icon: MessageSquare,
      badge: stats.pendingComments > 0 ? stats.pendingComments : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { label: 'Advertisements', path: '/admin/ads', icon: Megaphone },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'CV Editor', path: '/admin/cv', icon: FileBadge },
    { 
      label: 'Messages', 
      path: '/admin/messages', 
      icon: Mail,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-main)] transition-colors">
      
      {/* Desktop Sidebar (64 on md, fixed) */}
      <aside className="hidden lg:flex flex-col w-64 border-r fixed inset-y-0 z-30 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
        
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">
                Mr.Soth Admin
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Authenticated
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${active ? 'bg-white text-blue-700' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area: User info, public site & logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> View Live Blog
            </span>
            <span className="text-[10px] font-mono text-slate-400">Public ↗</span>
          </Link>

          <div className="pt-2 flex items-center justify-between px-2">
            <div className="text-xs truncate max-w-[140px]">
              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                {profile?.full_name || 'Mr. Soth'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate block">
                {user?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-[var(--bg-card)]/90 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live Blog
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b p-4 space-y-1 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 animate-in slide-in-from-top">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="p-4 sm:p-8 flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}
