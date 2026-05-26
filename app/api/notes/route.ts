import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { NotesData, CreateNotePayload } from '@/types';

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

export async function GET() {
  const data = readData();
  return NextResponse.json(data.notes);
}

export async function POST(req: NextRequest) {
  const body: CreateNotePayload = await req.json();
  const data = readData();

  const newNote = {
    id: randomUUID(),
    title: body.title.trim(),
    body: body.body.trim(),
    category: body.category.trim() || 'General',
    color: body.color,
    isJiraTicket: false,
    isHandled: false,
    isHighlighted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.notes.unshift(newNote);
  writeData(data);

  return NextResponse.json(newNote, { status: 201 });
}
