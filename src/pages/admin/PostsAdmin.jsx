import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PenSquare, 
  Trash2, 
  Eye, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle, 
  FileQuestion,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getPosts, deletePost, updatePost } from '../../lib/api.js';

export default function PostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getPosts({
        limit: 100,
        status: statusFilter,
        search: searchTerm
      });
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Error fetching admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, {
        status: nextStatus,
        published_at: nextStatus === 'published' ? (post.published_at || new Date().toISOString()) : null
      });
      fetchPosts();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePost(id);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Manage Articles
            </h1>
            <p className="text-xs text-slate-500">
              Create, edit, toggle visibility, and organize blog publications.
            </p>
          </div>

          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PenSquare className="w-4 h-4" /> Write New Post
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border p-4 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['all', 'published', 'draft'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts by title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          </form>
        </div>

        {/* Posts Table */}
        <div className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading articles...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <FileQuestion className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No posts found</p>
              <p>Create your first post or adjust filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Views</th>
                    <th className="px-4 py-3 font-semibold">Published</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {post.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          /{post.slug}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {post.category ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Uncategorized</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post)}
                          title="Click to toggle publish status"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase transition-colors ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {post.status}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                        {post.views || 0}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Draft'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'published' && (
                            <Link
                              to={`/post/${post.slug}`}
                              target="_blank"
                              title="View post on live site"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/posts/edit/${post.id}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-blue-400 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id, post.title)}
                            title="Delete article"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
