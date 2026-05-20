'use client';

import { useState, useEffect, useRef } from 'react';
import { Note, NoteColor, CreateNotePayload } from '@/types';

const COLORS: { value: NoteColor; label: string; bg: string; ring: string }[] = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-300', ring: 'ring-yellow-500' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-300', ring: 'ring-blue-500' },
  { value: 'green', label: 'Green', bg: 'bg-green-300', ring: 'ring-green-500' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-300', ring: 'ring-pink-500' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-300', ring: 'ring-purple-500' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-300', ring: 'ring-orange-500' },
];

interface Props {
  note?: Note | null;
  categories: string[];
  onSave: (payload: CreateNotePayload) => Promise<void>;
  onClose: () => void;
}

export default function NoteForm({ note, categories, onSave, onClose }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [category, setCategory] = useState(note?.category ?? 'General');
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'yellow');
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const allCategories = Array.from(new Set(['General', ...categories]));
  const isCustom = !allCategories.includes(category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return;

    setSaving(true);
    await onSave({
      title: title.trim(),
      body: body.trim(),
      category: customCategory.trim() || category,
      color,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Content</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note..."
              rows={5}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
            <div className="flex gap-2">
              <select
                value={isCustom ? '__custom__' : category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCategory('__custom__');
                  } else {
                    setCategory(e.target.value);
                    setCustomCategory('');
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              >
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ New category...</option>
              </select>
              {(category === '__custom__' || isCustom) && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              )}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all duration-150 ${
                    color === c.value ? `ring-2 ring-offset-2 ${c.ring} scale-110` : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!title.trim() && !body.trim())}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
