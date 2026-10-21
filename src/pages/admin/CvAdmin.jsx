import React, { useState, useEffect } from 'react';
import { 
  FileBadge, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { 
  getAllCvAdmin, 
  createCvSection, 
  updateCvSection, 
  deleteCvSection,
  createCvItem, 
  updateCvItem, 
  deleteCvItem 
} from '../../lib/api.js';

export default function CvAdmin() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section Modal state
  const [secModalOpen, setSecModalOpen] = useState(false);
  const [editingSecId, setEditingSecId] = useState(null);
  const [secKey, setSecKey] = useState('');
  const [secTitle, setSecTitle] = useState('');
  const [secIcon, setSecIcon] = useState('Briefcase');

  // Item Modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [itemLabel, setItemLabel] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemSubtitle, setItemSubtitle] = useState('');
  const [itemUrl, setItemUrl] = useState('');

  const fetchCv = async () => {
    setLoading(true);
    try {
      const data = await getAllCvAdmin();
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching CV admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCv();
  }, []);

  // Section CRUD
  const openCreateSecModal = () => {
    setEditingSecId(null);
    setSecKey('');
    setSecTitle('');
    setSecIcon('Briefcase');
    setSecModalOpen(true);
  };

  const openEditSecModal = (sec) => {
    setEditingSecId(sec.id);
    setSecKey(sec.key);
    setSecTitle(sec.title);
    setSecIcon(sec.icon || 'Briefcase');
    setSecModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!secKey.trim() || !secTitle.trim()) return;

    try {
      if (editingSecId) {
        await updateCvSection(editingSecId, { key: secKey.trim(), title: secTitle.trim(), icon: secIcon });
      } else {
        await createCvSection({ key: secKey.trim(), title: secTitle.trim(), icon: secIcon, position: sections.length + 1 });
      }
      setSecModalOpen(false);
      fetchCv();
    } catch (err) {
      alert('Error saving section: ' + err.message);
    }
  };

  const handleToggleSecVisibility = async (sec) => {
    try {
      await updateCvSection(sec.id, { is_visible: !sec.is_visible });
      fetchCv();
    } catch (err) {
      alert('Error updating visibility: ' + err.message);
    }
  };

  const handleDeleteSection = async (id, title) => {
    if (!window.confirm(`Delete CV Section "${title}" and all its rows?`)) return;
    try {
      await deleteCvSection(id);
      fetchCv();
    } catch (err) {
      alert('Error deleting section: ' + err.message);
    }
  };

  // Item CRUD
  const openCreateItemModal = (sectionId) => {
    setEditingItemId(null);
    setTargetSectionId(sectionId);
    setItemLabel('');
    setItemValue('');
    setItemSubtitle('');
    setItemUrl('');
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItemId(item.id);
    setTargetSectionId(item.section_id);
    setItemLabel(item.label || '');
    setItemValue(item.value || '');
    setItemSubtitle(item.subtitle || '');
    setItemUrl(item.url || '');
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemLabel.trim()) return;

    const payload = {
      section_id: targetSectionId,
      label: itemLabel.trim(),
      value: itemValue.trim() || null,
      subtitle: itemSubtitle.trim() || null,
      url: itemUrl.trim() || null,
    };

    try {
      if (editingItemId) {
        await updateCvItem(editingItemId, payload);
      } else {
        await createCvItem(payload);
      }
      setItemModalOpen(false);
      fetchCv();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this row from the section?')) return;
    try {
      await deleteCvItem(id);
      fetchCv();
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Curriculum Vitae Editor
            </h1>
            <p className="text-xs text-slate-500">
              Manage live resume sections (Summary, Experience, Skills, Education) and row items.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateSecModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>

        {/* Sections List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading CV data...</div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400">No CV sections exist yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-3xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs"
              >
                {/* Section Top Bar */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {section.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      key: {section.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSecVisibility(section)}
                      title={section.is_visible ? 'Visible on CV' : 'Hidden from CV'}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                        section.is_visible
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditSecModal(section)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openCreateItemModal(section.id)}
                      className="ml-2 flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>
                </div>

                {/* Section Items */}
                {(section.items || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No items in this section yet.</p>
                ) : (
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <span>{item.label}</span>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-blue-600"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.value && (
                            <span className="font-mono text-[11px] text-slate-400">
                              {item.value}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditItemModal(item)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
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
            ))}
          </div>
        )}

        {/* Section Modal */}
        {secModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingSecId ? 'Edit CV Section' : 'Create CV Section'}
              </h3>
              <form onSubmit={handleSaveSection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Section Title *</label>
                  <input
                    type="text"
                    required
                    value={secTitle}
                    onChange={(e) => setSecTitle(e.target.value)}
                    placeholder="e.g. Work Experience"
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Unique Key *</label>
                  <input
                    type="text"
                    required
                    value={secKey}
                    onChange={(e) => setSecKey(e.target.value)}
                    placeholder="e.g. experience"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Icon Style</label>
                  <select
                    value={secIcon}
                    onChange={(e) => setSecIcon(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  >
                    <option value="Briefcase">Briefcase (Work)</option>
                    <option value="Code">Code (Skills / Tech)</option>
                    <option value="GraduationCap">GraduationCap (Education)</option>
                    <option value="User">User (Bio / Summary)</option>
                    <option value="FolderKanban">FolderKanban (Projects)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSecModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
                  >
                    Save Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {itemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingItemId ? 'Edit Item Row' : 'Add Item Row'}
              </h3>
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Label / Title *</label>
                  <input
                    type="text"
                    required
                    value={itemLabel}
                    onChange={(e) => setItemLabel(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Value / Date Range</label>
                  <input
                    type="text"
                    value={itemValue}
                    onChange={(e) => setItemValue(e.target.value)}
                    placeholder="e.g. 2023 - Present"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={itemSubtitle}
                    onChange={(e) => setItemSubtitle(e.target.value)}
                    placeholder="Company details, responsibilities, or technologies used..."
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">External Link (Optional)</label>
                  <input
                    type="url"
                    value={itemUrl}
                    onChange={(e) => setItemUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
                  >
                    Save Row
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
