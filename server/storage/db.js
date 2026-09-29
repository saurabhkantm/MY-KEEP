import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'notes.json');

const INITIAL_SEED_NOTES = [
  {
    id: "note-welcome",
    title: "🚀 Welcome to KeepAI — Your AI Second Brain",
    content: "KeepAI is a full-stack workspace combining Google Keep's intuitive design with Google Gemini AI.\n\nKey Backend & AI Capabilities:\n• ⚡ Dedicated Node.js & Express REST API\n• 🛡️ Secure Server-Side Gemini AI proxying\n• 📋 Automatic To-Do Checklist Extractor\n• 🎯 Career Hub: Job Description to Interview Cheat Sheet\n• 🎙️ Speech-to-Text Voice Dictation\n• 💾 Persistent Database storage + JSON backups",
    isChecklist: false,
    checklistItems: [],
    color: "default",
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    tags: ["welcome", "guide", "ai"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "note-career-demo",
    title: "🎯 Senior Full-Stack Engineer: Interview Prep",
    content: "Core Competencies to Highlight:\n1. Architecture: Vite + React 18 frontend, Node.js + Express backend, REST APIs.\n2. AI Integration: Server-side Gemini API calls, structured JSON outputs, streaming tokens, robust offline fallbacks.\n3. STAR Story (High Scale Refactor):\n• Situation: Monolithic frontend had performance bottlenecks and exposed API keys.\n• Task: Architect a decoupled, full-stack system with secure backend AI proxies and sub-second HMR.\n• Action: Migrated to Vite 5, implemented Express REST API, added responsive CSS Grid masonry, built offline fallbacks.\n• Result: 10x faster build times, zero security vulnerabilities, and positive stakeholder reviews.",
    isChecklist: false,
    checklistItems: [],
    color: "coral",
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    tags: ["career", "interview", "full-stack"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "note-checklist-demo",
    title: "✅ Technical Job Application Checklist",
    content: "",
    isChecklist: true,
    checklistItems: [
      { id: "item-1", text: "Customize resume with targeted keywords", completed: true },
      { id: "item-2", text: "Polish GitHub portfolio with live demo links", completed: true },
      { id: "item-3", text: "Rehearse 2-minute behavioral pitch (STAR method)", completed: false },
      { id: "item-4", text: "Review React 18 hooks & Express REST API architecture", completed: false },
      { id: "item-5", text: "Prepare 3 insightful questions for the engineering manager", completed: false }
    ],
    color: "sage",
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    tags: ["career", "urgent"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Ensure data directory and file exist
async function ensureDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // File does not exist, seed it
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_SEED_NOTES, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

export async function getAllNotes() {
  await ensureDb();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error("Error reading database:", err);
    return [];
  }
}

export async function saveAllNotes(notes) {
  await ensureDb();
  await fs.writeFile(DB_FILE, JSON.stringify(notes, null, 2), 'utf-8');
  return notes;
}

export async function createNote(noteData) {
  const notes = await getAllNotes();
  const newNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: noteData.title || "",
    content: noteData.content || "",
    isChecklist: Boolean(noteData.isChecklist),
    checklistItems: noteData.checklistItems || [],
    color: noteData.color || "default",
    isPinned: Boolean(noteData.isPinned),
    isArchived: false,
    isTrashed: false,
    tags: noteData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.unshift(newNote);
  await saveAllNotes(notes);
  return newNote;
}

export async function updateNote(id, updates) {
  const notes = await getAllNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await saveAllNotes(notes);
  return notes[index];
}

export async function softDeleteNote(id) {
  return await updateNote(id, { isTrashed: true, isPinned: false });
}

export async function restoreNote(id) {
  return await updateNote(id, { isTrashed: false });
}

export async function permanentDeleteNote(id) {
  const notes = await getAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  await saveAllNotes(filtered);
  return { success: true, id };
}

export async function emptyTrash() {
  const notes = await getAllNotes();
  const activeNotes = notes.filter(n => !n.isTrashed);
  await saveAllNotes(activeNotes);
  return { success: true, removedCount: notes.length - activeNotes.length };
}

export async function duplicateNote(id) {
  const notes = await getAllNotes();
  const target = notes.find(n => n.id === id);
  if (!target) return null;

  const clone = {
    ...target,
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: target.title ? `${target.title} (Copy)` : "Copy",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.unshift(clone);
  await saveAllNotes(notes);
  return clone;
}
