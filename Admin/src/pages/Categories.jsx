import React, { useState, useMemo } from 'react';
import { Layers, Plus, Trash2, Inbox, Edit, X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const initialCategories = [
  { id: 1, name: 'Royal House', slug: 'royal-house', count: 4, description: 'Luxury estates and royal architectural residences.' },
  { id: 2, name: 'Farm Villa', slug: 'farm-villa', count: 3, description: 'Expansive private farm villas and countryside homes.' },
  { id: 3, name: 'Properties', slug: 'properties', count: 3, description: 'Urban residences, contemporary apartments, and lofts.' },
  { id: 4, name: 'Bestseller', slug: 'bestseller', count: 2, description: 'High demand prime luxury market residences.' }
];

const Categories = () => {
  const { isDark } = useTheme();

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [newCat, setNewCat] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' });
  const [autoSlug, setAutoSlug] = useState(true);

  // Helper to trigger toast
  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  // Dynamic count calculation from real properties
  const getCategoryCount = (catName, defaultCount) => {
    try {
      const savedProps = localStorage.getItem('admin_properties');
      if (savedProps) {
        const props = JSON.parse(savedProps);
        if (Array.isArray(props)) {
          const matchCount = props.filter(
            (p) => (p.category || '').trim().toLowerCase() === (catName || '').trim().toLowerCase()
          ).length;
          return matchCount;
        }
      }
    } catch {
      // fallback
    }
    return defaultCount ?? 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const trimmedName = newCat.trim();
    const newSlug = trimmedName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const updated = [
      ...categories,
      {
        id: Date.now(),
        name: trimmedName,
        slug: newSlug,
        count: 0,
        description: 'Custom category listing.'
      }
    ];
    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));
    setNewCat('');
    triggerToast(`Category "${trimmedName}" created successfully!`);
  };

  const handleDelete = (id) => {
    const target = categories.find((c) => c.id === id);
    const catName = target ? target.name : 'category';
    if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      localStorage.setItem('admin_categories', JSON.stringify(updated));
      triggerToast(`Category "${catName}" deleted.`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || ''
    });
    setAutoSlug(false);
  };

  // Handle Name Input in Edit Modal
  const handleEditNameChange = (val) => {
    setEditForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug
        ? val.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        : prev.slug
    }));
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editingCategory) return;

    const trimmedName = editForm.name.trim();
    const cleanSlug = editForm.slug.trim()
      ? editForm.slug.trim().toLowerCase().replace(/[^\w-]/g, '')
      : trimmedName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const oldName = editingCategory.name;

    const updated = categories.map((c) => {
      if (c.id === editingCategory.id) {
        return {
          ...c,
          name: trimmedName,
          slug: cleanSlug,
          description: editForm.description.trim() || 'Custom category listing.'
        };
      }
      return c;
    });

    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));

    // If the category name changed, synchronize existing properties in admin_properties
    if (oldName && oldName !== trimmedName) {
      try {
        const savedProps = localStorage.getItem('admin_properties');
        if (savedProps) {
          const props = JSON.parse(savedProps);
          if (Array.isArray(props)) {
            const updatedProps = props.map((p) => {
              if (p.category === oldName) {
                return { ...p, category: trimmedName };
              }
              return p;
            });
            localStorage.setItem('admin_properties', JSON.stringify(updatedProps));
          }
        }
      } catch (err) {
        console.error('Error synchronizing category in properties:', err);
      }
    }

    setEditingCategory(null);
    triggerToast(`Category "${trimmedName}" updated successfully!`);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-emerald-600 text-white border-emerald-500 animate-bounce text-xs font-semibold">
          <Check size={16} />
          <span>{successToast}</span>
        </div>
      )}

      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Catalog Categories
        </h1>
        <p className={`text-xs font-medium mt-1 ${
          isDark ? 'text-gray-400' : 'text-slate-500'
        }`}>
          Organize real estate and product catalog groupings.
        </p>
      </div>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className={`rounded-2xl p-5 border shadow-xs flex items-center gap-3 transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New Category Name (e.g. Waterfront, Penthouse, Villas)..."
          className={`flex-1 text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
            isDark
              ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
          }`}
        />
        <button
          type="submit"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
            isDark
              ? 'bg-white hover:bg-neutral-200 text-black border-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
          }`}
        >
          <Plus size={16} /> Add Category
        </button>
      </form>

      {/* Categories Grid or Empty State */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => {
            const count = getCategoryCount(c.name, c.count);
            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isDark
                    ? 'bg-black border-white hover:border-brand'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-xl border shadow-2xs ${
                      isDark ? 'bg-neutral-900 border-white text-white' : 'bg-slate-100 border-slate-200 text-brand'
                    }`}>
                      <Layers size={18} />
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isDark
                        ? 'text-white bg-neutral-900 border-white'
                        : 'text-slate-700 bg-slate-100 border-slate-200'
                    }`}>
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold mt-3 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.name}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {c.description || 'Custom category listing.'}
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                  isDark ? 'border-neutral-800 text-gray-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <code className="text-[11px] font-mono font-medium">/{c.slug}</code>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark
                          ? 'text-blue-400 hover:text-blue-300 hover:bg-neutral-900'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                      title="Edit Category"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`py-16 px-6 text-center flex flex-col items-center justify-center border rounded-2xl shadow-xs transition-colors ${
          isDark ? 'border-white bg-black' : 'border-slate-200 bg-white'
        }`}>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
            isDark ? 'bg-neutral-900 border-white text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <Inbox size={24} />
          </div>
          <h3 className={`text-sm font-bold mb-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            No Categories Found
          </h3>
          <p className={`text-xs max-w-xs ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Add categories using the form above to organize properties.
          </p>
        </div>
      )}

      {editingCategory && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <div
            className={`rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border space-y-5 transition-all ${
              isDark ? 'bg-neutral-950 border-white text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                    isDark ? 'bg-neutral-900 border-white text-white' : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}
                >
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">Edit Category</h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Update category details and slug identifier.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-neutral-800 text-gray-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editForm.name}
                  onChange={(e) => handleEditNameChange(e.target.value)}
                  placeholder="e.g. Waterfront, Penthouse, Villas"
                  className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Slug Identifier
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlug(true);
                      setEditForm((prev) => ({
                        ...prev,
                        slug: prev.name.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                      }));
                    }}
                    className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-2.5 text-xs font-mono select-none ${
                      isDark ? 'text-gray-500' : 'text-slate-400'
                    }`}
                  >
                    /
                  </span>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setEditForm((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="category-slug"
                    className={`w-full text-xs font-medium rounded-xl pl-7 pr-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description describing properties in this category..."
                  className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all resize-none focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                  }`}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-700 text-gray-300 hover:bg-neutral-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-200 border-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                  }`}
                >
                  <Check size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
