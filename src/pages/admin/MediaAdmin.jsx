import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getMediaAdmin, uploadFile, deleteMedia } from '../../lib/api.js';

export default function MediaAdmin() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await getMediaAdmin();
      setMediaList(data || []);
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file, file.name);
      fetchMedia();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete media item "${fileName}"?`)) return;
    try {
      await deleteMedia(id);
      fetchMedia();
    } catch (err) {
      alert('Error deleting media: ' + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cloudflare R2 Media Library
            </h1>
            <p className="text-xs text-slate-500">
              Upload images, PDFs, and assets to Cloudflare R2 object storage with zero egress fees.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading to R2...' : 'Upload File to R2'}
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading media library...</div>
        ) : mediaList.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Media library is empty</p>
            <p className="text-xs text-slate-400">Upload your first image or PDF above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaList.map((item) => {
              const isImage = item.mime_type?.startsWith('image/') || item.file_name?.match(/\.(jpe?g|png|gif|webp|svg)$/i);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-xs group"
                >
                  <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={item.public_url}
                        alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{item.mime_type || 'DOCUMENT'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.file_name}>
                        {item.file_name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{formatBytes(item.size_bytes)}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.public_url, item.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.file_name)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
