import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getPosts, getFeaturedPosts } from '../lib/api.js';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getPosts({ page, limit: 6, status: 'published' }),
      page === 1 ? getFeaturedPosts(2) : Promise.resolve([])
    ])
      .then(([postResult, featuredResult]) => {
        if (!mounted) return;
        setPosts(postResult.posts || []);
        setTotalPages(postResult.totalPages || 1);
        setTotalPosts(postResult.total || 0);
        if (page === 1) {
          setFeaturedPosts(featuredResult || []);
        }
      })
      .catch((err) => console.error('Error fetching home posts:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page]);

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
      <div className="space-y-10">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Web Engineering</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
              Engineering Notes, Cloud Experiments & Real-World Code.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
              Documenting solutions to difficult production bugs, React performance tricks, PostgreSQL security, and serverless edge architecture.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <Link
                to="/cv"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-md"
              >
                Explore My CV
              </Link>
              <Link
                to="/about"
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                About Mr. Soth
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Posts (Only visible on page 1) */}
        {page === 1 && featuredPosts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Featured Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs"
                >
                  <div>
                    {post.cover_url && (
                      <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-xl mb-4 aspect-video">
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      {post.category && (
                        <Link
                          to={`/category/${post.category.slug}`}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:underline"
                        >
                          {post.category.name}
                        </Link>
                      )}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time || 3} min read
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                      <Link to={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    <Link
                      to={`/post/${post.slug}`}
                      className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      Read Article <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Latest Articles {totalPosts > 0 && <span className="text-xs font-mono font-normal text-slate-400">({totalPosts})</span>}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 h-44" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">No published posts yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check back soon for new articles!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group rounded-2xl border p-5 sm:p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start"
                >
                  {post.cover_url && (
                    <Link
                      to={`/post/${post.slug}`}
                      className="w-full sm:w-48 sm:h-32 shrink-0 overflow-hidden rounded-xl aspect-video sm:aspect-auto"
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
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {post.category && (
                          <Link
                            to={`/category/${post.category.slug}`}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:underline"
                          >
                            {post.category.name}
                          </Link>
                        )}
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.reading_time || 3} min
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1 ml-auto">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                        <Link to={`/post/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {/* Tags */}
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
                        Read more <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium bg-[var(--bg-card)] border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => goToPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                      pNum === page
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-[var(--bg-card)] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium bg-[var(--bg-card)] border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}
