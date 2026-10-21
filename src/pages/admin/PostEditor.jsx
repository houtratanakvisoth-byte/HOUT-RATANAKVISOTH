import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Eye, 
  Edit3, 
  Check, 
  Clock, 
  Tag as TagIcon, 
  Folder, 
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { 
  getPostById, 
  createPost, 
  updatePost, 
  getCategories, 
  getTags, 
  createTag,
  uploadFile 
} from '../../lib/api.js';

export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [contentFormat, setContentFormat] = useState('markdown');
  const [coverUrl, setCoverUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(3);

  // Aux data & states
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Load existing post if edit mode
  useEffect(() => {
    Promise.all([getCategories(), getTags()]).then(([cats, tgs]) => {
      setCategories(cats || []);
      setTags(tgs || []);
    });

    if (isEdit) {
      getPostById(id)
        .then((post) => {
          if (post) {
            setTitle(post.title || '');
            setSlug(post.slug || '');
            setSlugManual(true);
            setExcerpt(post.excerpt || '');
            setContent(post.content || '');
            setContentFormat(post.content_format || 'markdown');
            setCoverUrl(post.cover_url || '');
            setCategoryId(post.category_id || '');
            setSelectedTagIds(post.tag_ids || []);
            setStatus(post.status || 'draft');
            setIsFeatured(Boolean(post.is_featured));
            setReadingTime(post.reading_time || 3);
          }
        })
        .catch((err) => setError('Failed to load post: ' + err.message));
    }
  }, [id, isEdit]);

  // Auto generate slug from title if not manually customized
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Auto calculate estimated reading time based on word count
  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const est = Math.max(1, Math.ceil(wordCount / 200));
    setReadingTime(est);
  };

  // Image Upload handler calling uploadFile (Worker -> R2)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const recorded = await uploadFile(file, `Cover for ${title || 'blog post'}`);
      if (recorded?.public_url) {
        setCoverUrl(recorded.public_url);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add new tag inline
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const tagName = newTagName.trim();
    const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const created = await createTag({ name: tagName, slug: tagSlug });
      setTags((prev) => [...prev, created]);
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName('');
    } catch (err) {
      alert('Could not add tag: ' + err.message);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId]
    );
  };

  // Save handler
  const handleSave = async (targetStatus) => {
    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required.');
      return;
    }

    setSaving(true);
    setError('');

    const finalStatus = targetStatus || status;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      content_format: contentFormat,
      cover_url: coverUrl.trim(),
      category_id: categoryId || null,
      status: finalStatus,
      is_featured: isFeatured,
      reading_time: Number(readingTime) || 1,
    };

    try {
      if (isEdit) {
        await updatePost(id, payload, selectedTagIds);
      } else {
        await createPost(payload, selectedTagIds);
      }
      navigate('/admin/posts');
    } catch (err) {
      setError('Failed to save post: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    if (!content) return '<p class="italic text-slate-400">Nothing to preview yet.</p>';
    const rawHtml = contentFormat === 'html' ? content : marked.parse(content);
    return DOMPurify.sanitize(rawHtml);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/posts"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Article' : 'Write New Article'}
              </h1>
              <p className="text-xs text-slate-500">
                Configure content format, tags, cover image, and publication state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Publish Article'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Editor Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Editing Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Title & Slug */}
            <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Scaling PostgreSQL Connection Pools on Cloudflare Edge..."
                  className="w-full text-base font-semibold px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlugManual(!slugManual)}
                    className="text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {slugManual ? 'Reset Auto Slug' : 'Customize Slug'}
                  </button>
                </div>
                <div className="flex items-center text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-slate-500">
                  <span>/post/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setSlug(e.target.value);
                    }}
                    className="flex-1 bg-transparent border-none text-slate-900 dark:text-white focus:outline-none ml-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Excerpt (Summary for SEO & cards)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence overview shown in feeds..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Content Editor with Write / Preview Tabs */}
            <div className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'write'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono">Format:</span>
                  <select
                    value={contentFormat}
                    onChange={(e) => setContentFormat(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">Raw HTML</option>
                  </select>
                </div>
              </div>

              {activeTab === 'write' ? (
                <textarea
                  rows={20}
                  value={content}
                  onChange={handleContentChange}
                  placeholder={`Write your post using ${contentFormat.toUpperCase()}...\n\n## Subheading\n\nParagraph text and code blocks here...`}
                  className="w-full p-4 text-xs sm:text-sm font-mono leading-relaxed bg-transparent text-slate-900 dark:text-white focus:outline-none resize-y min-h-[400px]"
                />
              ) : (
                <div 
                  className="p-6 prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm min-h-[400px]"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              )}
            </div>

          </div>

          {/* Sidebar Meta Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Status & Featured */}
            <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Publication Controls
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Live)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="is_featured" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Featured on Home page
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Est. Reading Time (minutes)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    className="w-20 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>
            </div>

            {/* Cover Image Upload (Cloudflare R2) */}
            <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Cover Image
              </h3>

              {coverUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 aspect-video relative group">
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://... image URL"
                  className="w-full text-xs px-3 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mb-2"
                />

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  {uploadingImage ? 'Uploading to R2...' : 'Upload Image to R2'}
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                Category
              </h3>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Selection & Quick Add */}
            <div className="rounded-2xl border p-5 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5" />
                Tags
              </h3>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {tags.map((t) => {
                  const selected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors flex items-center gap-1 ${
                        selected
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      #{t.name}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag..."
                    className="flex-1 text-xs px-2.5 py-1 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
