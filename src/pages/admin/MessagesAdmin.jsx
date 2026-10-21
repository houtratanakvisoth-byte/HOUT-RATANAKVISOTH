import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getContactMessagesAdmin, markContactMessageAsRead, deleteContactMessage } from '../../lib/api.js';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessagesAdmin();
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markContactMessageAsRead(id);
      fetchMessages();
    } catch (err) {
      alert('Error marking message read: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteContactMessage(id);
      fetchMessages();
    } catch (err) {
      alert('Error deleting message: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Contact Form Submissions
          </h1>
          <p className="text-xs text-slate-500">
            Messages and inquiries submitted by visitors from the public Contact page.
          </p>
        </div>

        <div className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Inbox is empty</p>
              <p>Inquiries will appear here when visitors use the contact form.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 space-y-3 transition-colors ${
                    msg.is_read
                      ? 'bg-[var(--bg-card)]'
                      : 'bg-blue-50/40 dark:bg-blue-950/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {msg.name}
                      </span>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        &lt;{msg.email}&gt;
                      </a>
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-blue-600 text-white uppercase">
                          New
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  {msg.subject && (
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Subject: {msg.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: ' + (msg.subject || 'Inquiry on Mr.Soth Blog'))}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Reply via Email ↗
                    </a>

                    <div className="flex items-center gap-2">
                      {!msg.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(msg.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
