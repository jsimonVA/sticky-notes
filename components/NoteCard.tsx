'use client';

import { useState } from 'react';
import { Note, NoteColor } from '@/types';

const colorMap: Record<NoteColor, { bg: string; header: string; border: string; badge: string }> = {
  yellow: {
    bg: 'bg-yellow-50',
    header: 'bg-yellow-200',
    border: 'border-yellow-300',
    badge: 'bg-yellow-300 text-yellow-900',
  },
  blue: {
    bg: 'bg-blue-50',
    header: 'bg-blue-200',
    border: 'border-blue-300',
    badge: 'bg-blue-300 text-blue-900',
  },
  green: {
    bg: 'bg-green-50',
    header: 'bg-green-200',
    border: 'border-green-300',
    badge: 'bg-green-300 text-green-900',
  },
  pink: {
    bg: 'bg-pink-50',
    header: 'bg-pink-200',
    border: 'border-pink-300',
    badge: 'bg-pink-300 text-pink-900',
  },
  purple: {
    bg: 'bg-purple-50',
    header: 'bg-purple-200',
    border: 'border-purple-300',
    badge: 'bg-purple-300 text-purple-900',
  },
  orange: {
    bg: 'bg-orange-50',
    header: 'bg-orange-200',
    border: 'border-orange-300',
    badge: 'bg-orange-300 text-orange-900',
  },
};

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colors = colorMap[note.color];

  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl border ${colors.border} ${colors.bg}
        shadow-md hover:shadow-xl transition-all duration-300 ease-in-out
        min-w-[220px] min-h-[160px] w-full
        hover:-translate-y-1
      `}
    >
      {/* Header */}
      <div className={`${colors.header} rounded-t-2xl px-4 py-3 flex items-start justify-between gap-2`}>
        <h2 className="font-semibold text-gray-800 text-sm leading-snug break-words flex-1 min-w-0">
          {note.title || 'Untitled'}
        </h2>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded-lg hover:bg-white/50 transition-colors text-gray-600 hover:text-gray-900"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(note.id)}
                className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 rounded-lg hover:bg-white/50 transition-colors text-gray-600 hover:text-red-600"
              title="Delete note"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-3">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {note.body || <span className="text-gray-400 italic">No content</span>}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 mt-1">
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
          {note.category}
        </span>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>
    </div>
  );
}
