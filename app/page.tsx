'use client';

import { useEffect, useState, useCallback } from 'react';
import { Note, CreateNotePayload } from '@/types';
import NoteCard from '@/components/NoteCard';
import NoteForm from '@/components/NoteForm';
import CategoryFilter from '@/components/CategoryFilter';
import FanModeOverlay from '@/components/FanModeOverlay';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [view, setView] = useState<'active' | 'handled'>('active');
  const [fanMode, setFanMode] = useState(false);
  const [fanAnimation, setFanAnimation] = useState<{ note: Note; rect: DOMRect } | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [jiraFilter, setJiraFilter] = useState<'all' | 'in-jira' | 'not-in-jira'>('all');
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

  // Highlighted notes always go to the sidebar — excluded from main grid
  const highlightedNotes = notes.filter((n) => n.isHighlighted);

  const handledCount = notes.filter((n) => n.isHandled && !n.isHighlighted).length;
  const categories = Array.from(
    new Set(notes.filter((n) => !n.isHandled && !n.isHighlighted).map((n) => n.category))
  ).sort();

  const filtered = notes.filter((n) => {
    if (n.isHighlighted) return false;
    if (view === 'active' && n.isHandled) return false;
    if (view === 'handled' && !n.isHandled) return false;
    const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
    const matchesJira =
      jiraFilter === 'all' ||
      (jiraFilter === 'in-jira' && n.isJiraTicket) ||
      (jiraFilter === 'not-in-jira' && !n.isJiraTicket);
    const q = search.toLowerCase();
    const matchesSearch =
      !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return matchesCategory && matchesJira && matchesSearch;
  });

  const notInJira = filtered.filter((n) => !n.isJiraTicket);
  const inJira = filtered.filter((n) => n.isJiraTicket);
  const showGrouped = view === 'active' && jiraFilter === 'all' && notInJira.length > 0 && inJira.length > 0;

  const patchNote = async (id: string, patch: object) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const updated: Note = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    return updated;
  };

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
    await patchNote(editingNote.id, payload);
    setEditingNote(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleFanDelete = (note: Note, rect: DOMRect) => setFanAnimation({ note, rect });

  const handleFanComplete = () => {
    if (fanAnimation) {
      handleDelete(fanAnimation.note.id);
      setFanAnimation(null);
    }
  };

  const handleToggleJira      = (note: Note) => patchNote(note.id, { isJiraTicket:   !note.isJiraTicket });
  const handleToggleHandled   = (note: Note) => patchNote(note.id, { isHandled:      !note.isHandled });
  const handleToggleHighlight = (note: Note) => patchNote(note.id, { isHighlighted:  !note.isHighlighted });

  const openEdit  = (note: Note) => { setEditingNote(note); setShowForm(false); };
  const closeForm = () => { setShowForm(false); setEditingNote(null); };

  const isFiltered = search || activeCategory !== 'All' || jiraFilter !== 'all';

  // Shared props for every NoteCard/NoteSection
  const cardHandlers = {
    fanMode,
    onEdit:             openEdit,
    onDelete:           handleDelete,
    onFanDelete:        handleFanDelete,
    onToggleJira:       handleToggleJira,
    onToggleHandled:    handleToggleHandled,
    onToggleHighlight:  handleToggleHighlight,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <span className="text-2xl">🗒️</span>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Sticky Notes</h1>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setView('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setView('handled')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === 'handled' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Handled
              {handledCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  view === 'handled' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {handledCount}
                </span>
              )}
            </button>
          </div>

          {/* FAN MODE toggle */}
          <button
            onClick={() => setFanMode((v) => !v)}
            title={fanMode ? 'FAN MODE ON — click to disable' : 'Enable FAN MODE'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 shrink-0 ${
              fanMode
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-300 scale-105'
                : 'bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
          >
            <span style={fanMode ? { display: 'inline-block', animation: 'fan-spin 0.6s linear infinite' } : {}}>
              <FanButtonIcon active={fanMode} />
            </span>
            <span className="hidden sm:inline">{fanMode ? 'FAN ON' : 'FAN'}</span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

          {view === 'active' && (
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
          )}
        </div>
      </header>

      {/* ── Page body ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 items-start">

        {/* ── Highlighted sidebar ── */}
        {highlightedNotes.length > 0 && (
          <aside className="w-72 shrink-0 sticky top-24 self-start">
            <div className="mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Highlighted</h2>
              <span className="text-xs text-gray-400">({highlightedNotes.length})</span>
              <div className="flex-1 h-px bg-amber-200" />
            </div>
            <div className="space-y-3">
              {highlightedNotes.map((note) => (
                <NoteCard key={note.id} note={note} {...cardHandlers} />
              ))}
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">

          {/* Filters — active view only */}
          {view === 'active' && (categories.length > 0 || notes.length > 0) && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  active={activeCategory}
                  onChange={(cat) => setActiveCategory(cat)}
                />
              )}
              {notes.length > 0 && (
                <div className="flex items-center gap-1 ml-auto bg-white border border-gray-200 rounded-xl p-1 shadow-sm shrink-0">
                  {(['all', 'not-in-jira', 'in-jira'] as const).map((val) => {
                    const labels = { all: 'All', 'not-in-jira': 'Needs Ticket', 'in-jira': 'In Jira' };
                    return (
                      <button
                        key={val}
                        onClick={() => setJiraFilter(val)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                          jiraFilter === val
                            ? val === 'in-jira'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : val === 'not-in-jira'
                              ? 'bg-amber-400 text-white shadow-sm'
                              : 'bg-indigo-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {labels[val]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Handled banner */}
          {view === 'handled' && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              These notes are marked as handled. Uncheck any note to move it back to active.
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
              <div className="text-6xl mb-4">{view === 'handled' ? '✅' : '📝'}</div>
              <h2 className="text-xl font-semibold text-gray-500 mb-2">
                {view === 'handled' ? 'No handled notes'
                  : isFiltered ? 'No notes match your filter'
                  : 'No notes yet'}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {view === 'handled'
                  ? "Mark notes as handled and they'll appear here."
                  : isFiltered ? 'Try adjusting your search or filters.'
                  : 'Create your first sticky note to get started.'}
              </p>
              {view === 'active' && !isFiltered && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
                >
                  Create a note
                </button>
              )}
            </div>
          )}

          {/* Notes grid */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-10">
              {showGrouped ? (
                <>
                  <NoteSection title="Needs Jira Ticket" indicator="amber" notes={notInJira} {...cardHandlers} />
                  <NoteSection title="In Jira"            indicator="blue"  notes={inJira}    {...cardHandlers} />
                </>
              ) : (
                <NoteSection notes={filtered} {...cardHandlers} />
              )}
            </div>
          )}

          {/* Note count */}
          {!loading && notes.length > 0 && (
            <p className="mt-8 text-center text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
              {view === 'handled' && ' · Handled'}
              {activeCategory !== 'All' && ` in "${activeCategory}"`}
              {jiraFilter === 'in-jira' && ' · In Jira'}
              {jiraFilter === 'not-in-jira' && ' · Needs Ticket'}
              {search && ` matching "${search}"`}
            </p>
          )}
        </main>
      </div>

      {/* Fan Mode Overlay */}
      {fanAnimation && (
        <FanModeOverlay note={fanAnimation.note} rect={fanAnimation.rect} onComplete={handleFanComplete} />
      )}

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

// ── NoteSection ────────────────────────────────────────────────────────────────

interface NoteSectionProps {
  title?: string;
  indicator?: 'amber' | 'blue';
  notes: Note[];
  fanMode: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onFanDelete: (note: Note, rect: DOMRect) => void;
  onToggleJira: (note: Note) => void;
  onToggleHandled: (note: Note) => void;
  onToggleHighlight: (note: Note) => void;
}

function NoteSection({ title, indicator, notes, ...handlers }: NoteSectionProps) {
  return (
    <div>
      {title && (
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
            indicator === 'blue' ? 'bg-blue-500' : 'bg-amber-400'
          }`} />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
          <span className="text-xs text-gray-400 font-normal normal-case tracking-normal">({notes.length})</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="break-inside-avoid">
            <NoteCard note={note} {...handlers} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FanButtonIcon ──────────────────────────────────────────────────────────────

function FanButtonIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 42 42">
      {[0, 90, 180, 270].map((angle) => (
        <ellipse key={angle} cx="21" cy="13" rx="6" ry="10"
          fill={active ? 'white' : 'currentColor'}
          opacity={active ? '0.9' : '0.6'}
          transform={`rotate(${angle} 21 21)`}
        />
      ))}
      <circle cx="21" cy="21" r="5" fill={active ? 'white' : 'currentColor'} />
      <circle cx="21" cy="21" r="2.5" fill={active ? '#6366f1' : '#e5e7eb'} />
    </svg>
  );
}
