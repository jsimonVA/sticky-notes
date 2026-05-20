import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NotesData, UpdateNotePayload } from '@/types';

const DATA_PATH = join(process.cwd(), 'data', 'notes.json');

function readData(): NotesData {
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return { notes: [] };
  }
}

function writeData(data: NotesData): void {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: UpdateNotePayload = await req.json();
  const data = readData();

  const index = data.notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  data.notes[index] = {
    ...data.notes[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  };

  writeData(data);
  return NextResponse.json(data.notes[index]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = readData();

  const index = data.notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  data.notes.splice(index, 1);
  writeData(data);

  return NextResponse.json({ success: true });
}
