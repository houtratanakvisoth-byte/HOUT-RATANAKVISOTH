import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Folder, 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getCategoryBySlug, getPosts } from '../lib/api.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getCategoryBySlug(slug)
      .then((cat) => {
        if (!mounted) return;
        setCategory(cat);
        return getPosts({
          categorySlug: slug,
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
      .catch((err) => console.error('Error fetching category posts:', err))
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
        
        {/* Category Header */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-blue-100 dark:border-slate-800">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Category
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {category?.name || slug}
              </h1>
            </div>
          </div>

          {category?.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-400">
            {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} in this category
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
              No articles found in this category yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Articles will appear here once published.
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
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time || 3} min
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
                    <div className="flex flex-wrap gap-1.5">
                      {(post.tags || []).slice(0, 3).map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/tag/${tag.slug}`}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>

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
