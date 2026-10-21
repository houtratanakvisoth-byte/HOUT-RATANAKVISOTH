import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Tag as TagIcon, 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  CornerDownRight, 
  Share2, 
  Check
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Layout from '../components/Layout.jsx';
import AdSlot from '../components/AdSlot.jsx';
import { getPostBySlug, getCommentsByPostId, createComment } from '../lib/api.js';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
});

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Comment Form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyParentId, setReplyParentId] = useState(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setCommentSuccess(false);

    getPostBySlug(slug, true)
      .then((data) => {
        if (!mounted) return;
        setPost(data);
        if (data?.id) {
          return getCommentsByPostId(data.id);
        }
        return [];
      })
      .then((commData) => {
        if (mounted && commData) {
          setComments(commData);
        }
      })
      .catch((err) => console.error('Error loading post detail:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!post?.id || !authorName.trim() || !authorEmail.trim() || !commentContent.trim()) {
      return;
    }

    setCommentSubmitting(true);
    setCommentError('');
    try {
      await createComment({
        postId: post.id,
        parentId: replyParentId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        content: commentContent.trim()
      });
      setCommentSuccess(true);
      setCommentContent('');
      setReplyParentId(null);
    } catch (err) {
      setCommentError(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const renderSanitizedContent = (content, format) => {
    if (!content) return '';
    let html = '';
    if (format === 'html') {
      html = content;
    } else {
      // Default markdown
      html = marked.parse(content);
    }
    return DOMPurify.sanitize(html);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-2">Article Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The article you are looking for does not exist or may have been un-published.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="space-y-8">
        
        {/* Back navigation & Metadata */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all articles
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.category && (
              <Link
                to={`/category/${post.category.slug}`}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:underline"
              >
                {post.category.name}
              </Link>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time || 3} min read
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              {post.views || 1} views
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Cover Image */}
        {post.cover_url && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-[440px]">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* In-Article Advertisement Slot */}
        <AdSlot slot="in_article" className="my-6" />

        {/* Sanitized Main Content */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
            prose-p:my-4 prose-p:text-sm sm:prose-p:text-base
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800
            prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:font-mono prose-code:text-xs sm:prose-code:text-sm
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-700
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r"
          dangerouslySetInnerHTML={{
            __html: renderSanitizedContent(post.content, post.content_format),
          }}
        />

        {/* Below-Post Advertisement Slot */}
        <AdSlot slot="below_post" className="my-8" />

        {/* Tags & Share Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <TagIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400">Tags:</span>
            {(post.tags || []).map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-300 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Article</span>
              </>
            )}
          </button>
        </div>

        {/* Author Bio Box */}
        <div className="rounded-2xl border p-6 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 flex items-start gap-4">
          <img
            src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={post.author?.full_name || 'Mr. Soth'}
            className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-blue-500/20"
          />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Written by {post.author?.full_name || 'Mr. Soth'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {post.author?.bio || 'Software Engineer writing practical articles about modern web applications, PostgreSQL, and full-stack system architecture.'}
            </p>
            <Link
              to="/about"
              className="inline-block mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Learn more about the author →
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Discussion ({comments.length})
            </h3>
          </div>

          {/* Comment Submission Form */}
          <div className="rounded-2xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {replyParentId ? 'Leave a Reply' : 'Leave a Comment'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Your email will not be published. Comments are reviewed by the admin prior to publication.
            </p>

            {commentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Thank you! Your comment has been submitted.</p>
                  <p className="text-emerald-600 dark:text-emerald-400">
                    It will appear on the post once reviewed and approved by the admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCommentSuccess(false)}
                    className="mt-2 text-xs font-medium underline"
                  >
                    Submit another comment
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                {replyParentId && (
                  <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    <span>Replying to comment #{replyParentId}</span>
                    <button
                      type="button"
                      onClick={() => setReplyParentId(null)}
                      className="font-bold hover:underline"
                    >
                      Cancel reply
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Sophy Chan"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="e.g. sophy@example.com"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Comment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or technical questions..."
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {commentError && (
                  <p className="text-xs text-red-500">{commentError}</p>
                )}

                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  {commentSubmitting ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            )}
          </div>

          {/* Approved Comments List */}
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {comments
                .filter((c) => !c.parent_id)
                .map((comment) => {
                  const replies = comments.filter((r) => r.parent_id === comment.id);
                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl border p-4 sm:p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {comment.author_name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReplyParentId(comment.id)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" /> Reply
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-10">
                        {comment.content}
                      </p>

                      {/* Nested Replies */}
                      {replies.length > 0 && (
                        <div className="pl-10 space-y-3 pt-2">
                          {replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-xl border p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">
                                  {reply.author_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {reply.author_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 pl-8 whitespace-pre-line">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </section>

      </article>
    </Layout>
  );
}
