import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Tag as TagIcon, 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getTagBySlug, getPosts } from '../lib/api.js';

export default function TagPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getTagBySlug(slug)
      .then((t) => {
        if (!mounted) return;
        setTag(t);
        return getPosts({
          tagSlug: slug,
          page,
          limit: 10,
          status: 'published'
        });
      })
      .then((res) => {
        if (!mounted || !res) return;
        setPosts(res.posts || []);
        setTotalPages(res.totalPages || 1);
        setTotalPosts(res.total || 0);
      })
      .catch((err) => console.error('Error fetching tag posts:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
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
        
        {/* Tag Header */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-indigo-100 dark:border-slate-800">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Tag Filter
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                #{tag?.name || slug}
              </h1>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-400">
            {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} tagged with #{tag?.name || slug}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 h-36" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No articles tagged with #{tag?.name || slug} yet.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse all articles →
            </Link>
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
