import React, { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  Upload, 
  Check, 
  X,
  Code2,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getAllAdsAdmin, createAd, updateAd, deleteAd, uploadFile } from '../../lib/api.js';

const SLOTS = [
  { value: 'header', label: 'Header (Top Banner)' },
  { value: 'sidebar_top', label: 'Sidebar Top' },
  { value: 'sidebar_bottom', label: 'Sidebar Bottom' },
  { value: 'in_article', label: 'In Article (Mid Content)' },
  { value: 'below_post', label: 'Below Post (Bottom Content)' },
  { value: 'footer', label: 'Footer (Site Bottom)' }
];

export default function AdsAdmin() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slot, setSlot] = useState('header');
  const [adType, setAdType] = useState('image');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const [width, setWidth] = useState(728);
  const [height, setHeight] = useState(90);
  const [position, setPosition] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await getAllAdsAdmin();
      setAds(data || []);
    } catch (err) {
      console.error('Error loading ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAdId(null);
    setName('');
    setSlot('header');
    setAdType('image');
    setImageUrl('');
    setLinkUrl('');
    setScriptCode('');
    setWidth(728);
    setHeight(90);
    setPosition(1);
    setIsActive(true);
    setStartsAt('');
    setEndsAt('');
    setModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingAdId(ad.id);
    setName(ad.name || '');
    setSlot(ad.slot || 'header');
    setAdType(ad.ad_type || 'image');
    setImageUrl(ad.image_url || '');
    setLinkUrl(ad.link_url || '');
    setScriptCode(ad.script_code || '');
    setWidth(ad.width || 0);
    setHeight(ad.height || 0);
    setPosition(ad.position || 1);
    setIsActive(ad.is_active !== false);
    setStartsAt(ad.starts_at ? new Date(ad.starts_at).toISOString().slice(0, 16) : '');
    setEndsAt(ad.ends_at ? new Date(ad.ends_at).toISOString().slice(0, 16) : '');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadFile(file, `Ad creative - ${name || 'banner'}`);
      if (res?.public_url) {
        setImageUrl(res.public_url);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slot,
      ad_type: adType,
      image_url: adType === 'image' ? imageUrl.trim() : null,
      link_url: adType === 'image' ? linkUrl.trim() : null,
      script_code: adType === 'script' ? scriptCode.trim() : null,
      width: width ? parseInt(width, 10) : null,
      height: height ? parseInt(height, 10) : null,
      position: parseInt(position, 10) || 0,
      is_active: isActive,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    };

    try {
      if (editingAdId) {
        await updateAd(editingAdId, payload);
      } else {
        await createAd(payload);
      }
      setModalOpen(false);
      fetchAds();
    } catch (err) {
      alert('Error saving ad: ' + err.message);
    }
  };

  const handleToggleActive = async (ad) => {
    try {
      await updateAd(ad.id, { is_active: !ad.is_active });
      fetchAds();
    } catch (err) {
      alert('Error toggling ad status: ' + err.message);
    }
  };

  const handleDelete = async (id, adName) => {
    if (!window.confirm(`Delete advertisement "${adName}"?`)) return;
    try {
      await deleteAd(id);
      fetchAds();
    } catch (err) {
      alert('Error deleting ad: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Advertisement Manager
            </h1>
            <p className="text-xs text-slate-500">
              Configure banner slots, custom Google AdSense scripts, impressions, and click analytics.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Ad
          </button>
        </div>

        {/* Ads Table */}
        <div className="rounded-2xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading advertisement slots...</div>
          ) : ads.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Megaphone className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No ads configured</p>
              <p>Add image banners or script ads to monetize slots.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Ad Name</th>
                    <th className="px-4 py-3 font-semibold">Slot</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Impressions</th>
                    <th className="px-4 py-3 font-semibold text-center">Clicks (CTR)</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {ads.map((ad) => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {ad.name}
                          </div>
                          {ad.ad_type === 'image' && ad.link_url && (
                            <a
                              href={ad.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-blue-500 hover:underline truncate max-w-xs block"
                            >
                              {ad.link_url}
                            </a>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs text-blue-600 dark:text-blue-400">
                          {ad.slot}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold flex items-center gap-1 w-fit ${
                            ad.ad_type === 'script'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {ad.ad_type === 'script' ? <Code2 className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            {ad.ad_type}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(ad)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                              ad.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                          {ad.impressions || 0}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                          {ad.clicks || 0} <span className="text-[10px] text-slate-400">({ctr}%)</span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(ad)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(ad.id, ad.name)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  {editingAdId ? 'Edit Advertisement' : 'Create Advertisement'}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ad Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cloudflare Developer Banner"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Placement Slot *
                    </label>
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {SLOTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} ({s.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ad Type *
                    </label>
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="image">Image Banner (Click to URL)</option>
                      <option value="script">Raw HTML / Script (AdSense / JS)</option>
                    </select>
                  </div>
                </div>

                {adType === 'image' ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Image Creative URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://... image banner"
                          className="flex-1 text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5 inline mr-1" />
                          {uploadingImage ? '...' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Link URL
                      </label>
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com/affiliate-or-product"
                        className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      JavaScript / HTML Script Code (AdSense)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Scripts are safely extracted and executed dynamically via document.createElement('script').
                    </p>
                    <textarea
                      rows={5}
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>..."
                      className="w-full text-xs font-mono p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date / Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date / Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_toggle"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active_toggle" className="text-xs font-semibold cursor-pointer">
                      Campaign is Active
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      {editingAdId ? 'Save Changes' : 'Create Ad'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
