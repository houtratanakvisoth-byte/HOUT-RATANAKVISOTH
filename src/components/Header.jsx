import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  FileText, 
  User, 
  Mail, 
  BookOpen
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.jsx';
import { getCategories } from '../lib/api.js';

export default function Header() {
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize theme from html attribute or localStorage
    const savedTheme = localStorage.getItem('mrsoth_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Fetch categories for menu
    getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.warn('Could not load categories for header:', err));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('mrsoth_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-[var(--bg-card)]/90 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              Mr.Soth
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
                BLOG
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Web & Edge Notes
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              location.pathname === '/' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Home
          </Link>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              Categories
            </button>

            {categoriesDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-56 rounded-xl shadow-xl border p-2 z-50 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Browse by Topic
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/cv"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              location.pathname === '/cv' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Curriculum Vitae
          </Link>

          <Link
            to="/about"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              location.pathname === '/about' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            About
          </Link>

          <Link
            to="/contact"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              location.pathname === '/contact' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            <Mail className="w-4 h-4 text-slate-400" />
            Contact
          </Link>
        </nav>

        {/* Actions: Search, Theme Toggle, Admin */}
        <div className="flex items-center gap-2">
          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs rounded-full border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:w-64 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
          </form>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Admin / Login Button */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          ) : user ? (
            <Link
              to="/admin/login"
              className="text-xs px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-xs px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-mono"
            >
              [Admin]
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 pt-3 pb-6 space-y-3 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          </form>

          <div className="flex flex-col space-y-1 font-medium text-slate-800 dark:text-slate-200">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/cv"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Curriculum Vitae (CV)
            </Link>
            <Link
              to="/about"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              About Me
            </Link>
            <Link
              to="/contact"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Contact Form
            </Link>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 px-3 font-semibold">
                Categories
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="px-3 py-1.5 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
