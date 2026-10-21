import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  MessageSquare, 
  Megaphone, 
  Users, 
  Mail, 
  Eye, 
  PenSquare, 
  ArrowRight, 
  Check, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { 
  getAdminDashboardStats, 
  getPosts, 
  getAllCommentsAdmin, 
  approveComment, 
  deleteComment 
} from '../../lib/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    pendingComments: 0,
    activeAds: 0,
    totalSubscribers: 0,
    unreadMessages: 0,
    totalViews: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsData, postsResult, commentsData] = await Promise.all([
        getAdminDashboardStats(),
        getPosts({ limit: 5, status: 'all' }),
        getAllCommentsAdmin({ filter: 'pending' })
      ]);

      setStats(statsData || {});
      setRecentPosts(postsResult.posts || []);
      setPendingComments((commentsData || []).slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApproveComment = async (id) => {
    try {
      await approveComment(id);
      loadDashboardData();
    } catch (err) {
      alert('Failed to approve comment: ' + err.message);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await deleteComment(id);
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="rounded-3xl border p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white/10 text-blue-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Control Center
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to Mr.Soth Blog Admin
            </h1>
            <p className="text-xs text-blue-100 max-w-xl">
              Write articles, manage advertisement slots, approve reader comments, and update CV details.
            </p>
          </div>

          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-md"
          >
            <PenSquare className="w-4 h-4" /> Create New Post
          </Link>
        </div>

        {/* 8 Stats Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Posts</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalPosts}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.publishedPosts} published / {stats.draftPosts} drafts
            </div>
          </div>

          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Pending Comments</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.pendingComments}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              Requires review & approval
            </div>
          </div>

          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Active Ads</span>
              <Megaphone className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.activeAds}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Running across 6 slots
            </div>
          </div>

          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Subscribers</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalSubscribers}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Newsletter audience
            </div>
          </div>

        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Unread Contact Messages</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {stats.unreadMessages}
              </div>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View messages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Article Reads</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                {stats.totalViews}
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">All-time count</span>
          </div>
        </div>

        {/* Two-Column Activity Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Posts (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Recent Articles
              </h2>
              <Link
                to="/admin/posts"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No posts created yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {post.views || 0} views
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                    </div>

                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Comments Awaiting Approval (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Comments to Review ({pendingComments.length})
              </h2>
              <Link
                to="/admin/comments"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Manage →
              </Link>
            </div>

            {pendingComments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-500" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">All caught up!</p>
                <p>No comments are currently waiting for approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingComments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {comm.author_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {comm.author_email}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      "{comm.content}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        on {comm.post_title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApproveComment(comm.id)}
                          title="Approve Comment"
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comm.id)}
                          title="Delete Comment"
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
