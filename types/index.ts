export interface Note {
  id: string;
  title: string;
  body: string;
  category: string;
  color: NoteColor;
  isJiraTicket: boolean;
  isHandled: boolean;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

export interface NotesData {
  notes: Note[];
}

export interface CreateNotePayload {
  title: string;
  body: string;
  category: string;
  color: NoteColor;
}

export interface UpdateNotePayload extends Partial<CreateNotePayload> {
  id: string;
}
