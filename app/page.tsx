'use client';

import { useEffect, useState, useCallback } from 'react';
import { Note, CreateNotePayload } from '@/types';
import NoteCard from '@/components/NoteCard';
import NoteForm from '@/components/NoteForm';
import CategoryFilter from '@/components/CategoryFilter';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes');
    const data: Note[] = await res.json();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const categories = Array.from(new Set(notes.map((n) => n.category))).sort();

  const filtered = notes.filter((n) => {
    const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCreate = async (payload: CreateNotePayload) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const newNote: Note = await res.json();
    setNotes((prev) => [newNote, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (payload: CreateNotePayload) => {
    if (!editingNote) return;
    const res = await fetch(`/api/notes/${editingNote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const updated: Note = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setEditingNote(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-2xl">🗒️</span>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Sticky Notes</h1>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
          </div>

          <div className="ml-auto">
            <button
              onClick={() => { setShowForm(true); setEditingNote(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 shadow-md shadow-indigo-200 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={(cat) => setActiveCategory(cat)}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              {search || activeCategory !== 'All' ? 'No notes match your filter' : 'No notes yet'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {search || activeCategory !== 'All'
                ? 'Try a different search or category.'
                : 'Create your first sticky note to get started.'}
            </p>
            {!search && activeCategory === 'All' && (
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
              >
                Create a note
              </button>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {!loading && filtered.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((note) => (
              <div key={note.id} className="break-inside-avoid">
                <NoteCard
                  note={note}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* Note count */}
        {!loading && notes.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
            {activeCategory !== 'All' && ` in "${activeCategory}"`}
            {search && ` matching "${search}"`}
          </p>
        )}
      </main>

      {/* Form Modal */}
      {(showForm || editingNote) && (
        <NoteForm
          note={editingNote}
          categories={categories}
          onSave={editingNote ? handleUpdate : handleCreate}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
