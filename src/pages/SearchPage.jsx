import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getPosts } from '../lib/api.js';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(q);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(q);
    if (!q.trim()) {
      setPosts([]);
      setTotalPages(1);
      setTotalPosts(0);
      return;
    }

    let mounted = true;
    setLoading(true);

    getPosts({ search: q.trim(), page, limit: 10, status: 'published' })
      .then((res) => {
        if (!mounted) return;
        setPosts(res.posts || []);
        setTotalPages(res.totalPages || 1);
        setTotalPosts(res.total || 0);
      })
      .catch((err) => console.error('Error during search:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [q, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), page: '1' });
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ q, page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Search Header & Input */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Search Articles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Search across post titles, excerpts, and topics.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords (e.g. React, Supabase, Cloudflare, PostgreSQL)..."
              className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {q && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
              Found {totalPosts} {totalPosts === 1 ? 'result' : 'results'} for <span className="font-semibold text-blue-600 dark:text-blue-400">"{q}"</span>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 h-36" />
            ))}
          </div>
        ) : !q.trim() ? (
          <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
            <Search className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Enter a search keyword above to find articles.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try searching for "React", "Cloudflare", "Worker", "PostgreSQL", or "Database".
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No articles found matching "{q}".
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try different keywords or check spelling.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start"
              >
                {post.cover_url && (
                  <Link
                    to={`/post/${post.slug}`}
                    className="w-full sm:w-44 sm:h-28 shrink-0 overflow-hidden rounded-xl aspect-video sm:aspect-auto"
                  >
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </Link>
                )}

                <div className="flex-1 w-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2">
                      {post.category && (
                        <Link
                          to={`/category/${post.category.slug}`}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:underline"
                        >
                          {post.category.name}
                        </Link>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Eye className="w-3 h-3" />
                        {post.views || 0}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                      <Link to={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.reading_time || 3} min
                    </span>

                    <Link
                      to={`/post/${post.slug}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      Read <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium bg-[var(--bg-card)] border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-mono px-3">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium bg-[var(--bg-card)] border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}
