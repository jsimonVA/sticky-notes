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
  onToggleJira: (note: Note) => void;
  onToggleHandled: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onToggleJira, onToggleHandled }: Props) {
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
        group relative flex flex-col rounded-2xl border ${colors.border}
        ${note.isHandled ? 'bg-gray-50 opacity-75' : colors.bg}
        shadow-md hover:shadow-xl transition-all duration-300 ease-in-out
        min-w-[220px] min-h-[160px] w-full
        hover:-translate-y-1
      `}
    >
      {/* Header */}
      <div className={`${note.isHandled ? 'bg-gray-200' : colors.header} rounded-t-2xl px-4 py-3 flex items-start justify-between gap-2`}>
        {/* Handled checkbox */}
        <button
          onClick={() => onToggleHandled(note)}
          title={note.isHandled ? 'Mark as active' : 'Mark as handled'}
          className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            note.isHandled
              ? 'bg-green-500 border-green-500'
              : 'border-gray-400 bg-white/60 hover:border-green-400'
          }`}
        >
          {note.isHandled && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <h2 className={`font-semibold text-sm leading-snug break-words flex-1 min-w-0 ${note.isHandled ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleJira(note)}
            title={note.isJiraTicket ? 'Mark as not a Jira ticket' : 'Mark as Jira ticket'}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-all duration-200 ${
              note.isJiraTicket
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-transparent border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500'
            }`}
          >
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 13.67l-2.965-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.993.889z"/>
            </svg>
            {note.isJiraTicket ? 'In Jira' : 'Jira'}
          </button>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
