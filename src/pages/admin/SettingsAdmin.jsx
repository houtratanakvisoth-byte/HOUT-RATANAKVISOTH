import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getSiteSettings, updateSiteSettings, uploadFile } from '../../lib/api.js';

export default function SettingsAdmin() {
  const [siteTitle, setSiteTitle] = useState('Mr.Soth Blog');
  const [tagline, setTagline] = useState('');
  const [authorName, setAuthorName] = useState('Mr. Soth');
  const [authorTitle, setAuthorTitle] = useState('Senior Software Engineer');
  const [authorBio, setAuthorBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cvPdfUrl, setCvPdfUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    getSiteSettings('general').then((data) => {
      if (data) {
        setSiteTitle(data.site_title || 'Mr.Soth Blog');
        setTagline(data.tagline || '');
        setAuthorName(data.author_name || 'Mr. Soth');
        setAuthorTitle(data.author_title || 'Senior Software Engineer');
        setAuthorBio(data.author_bio || '');
        setAvatarUrl(data.avatar_url || '');
        setCvPdfUrl(data.cv_pdf_url || '');
        setGithubUrl(data.github_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        setTwitterUrl(data.twitter_url || '');
        setContactEmail(data.contact_email || '');
      }
    });
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await uploadFile(file, 'Profile avatar');
      if (res?.public_url) {
        setAvatarUrl(res.public_url);
      }
    } catch (err) {
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const res = await uploadFile(file, 'CV Document');
      if (res?.public_url) {
        setCvPdfUrl(res.public_url);
      }
    } catch (err) {
      alert('PDF upload failed: ' + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const payload = {
      site_title: siteTitle.trim(),
      tagline: tagline.trim(),
      author_name: authorName.trim(),
      author_title: authorTitle.trim(),
      author_bio: authorBio.trim(),
      avatar_url: avatarUrl.trim(),
      cv_pdf_url: cvPdfUrl.trim(),
      github_url: githubUrl.trim(),
      linkedin_url: linkedinUrl.trim(),
      twitter_url: twitterUrl.trim(),
      contact_email: contactEmail.trim(),
    };

    try {
      await updateSiteSettings('general', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Site Settings
            </h1>
            <p className="text-xs text-slate-500">
              Manage site identity, author profile cards, CV PDF attachments, and social links.
            </p>
          </div>
        </div>

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Site settings updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Site Identity */}
          <div className="rounded-3xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Site Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Site Title</label>
                <input
                  type="text"
                  required
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Author Profile */}
          <div className="rounded-3xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Author Profile & Bio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Author Full Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Professional Title</label>
                <input
                  type="text"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Author Bio (Sidebar & About)</label>
              <textarea
                rows={3}
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Avatar Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  {uploadingAvatar ? '...' : 'Upload'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">CV PDF Download URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cvPdfUrl}
                  onChange={(e) => setCvPdfUrl(e.target.value)}
                  placeholder="https://... my_resume.pdf"
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="file"
                  accept=".pdf"
                  ref={pdfInputRef}
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingPdf}
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  {uploadingPdf ? '...' : 'Upload PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Social & Contact */}
          <div className="rounded-3xl border p-6 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Social Profiles & Contact Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@mrsoth.dev"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Settings...' : 'Save All Settings'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
