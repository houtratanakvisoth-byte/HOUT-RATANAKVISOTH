import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, Trash2, Filter } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getAllCommentsAdmin, approveComment, deleteComment } from '../../lib/api.js';

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved'

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getAllCommentsAdmin({ filter });
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      await approveComment(id);
      fetchComments();
    } catch (err) {
      alert('Error approving comment: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await deleteComment(id);
      fetchComments();
    } catch (err) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reader Discussions
            </h1>
            <p className="text-xs text-slate-500">
              Review and moderate incoming visitor comments before they appear on the public site.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No comments found</p>
              <p>Incoming reader submissions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {comment.author_name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({comment.author_email})
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          comment.is_approved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {comment.is_approved ? 'Approved' : 'Pending Review'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 ml-auto sm:ml-0">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {comment.content}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Posted on article: <span className="font-semibold text-slate-600 dark:text-slate-300">{comment.post_title}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    {!comment.is_approved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(comment.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
