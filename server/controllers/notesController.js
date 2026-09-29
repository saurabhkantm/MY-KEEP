import * as db from '../storage/db.js';

export async function getNotes(req, res) {
  try {
    const { search, view, tag } = req.query;
    let notes = await db.getAllNotes();

    // 1. Filter by search query
    if (search && search.trim()) {
      const q = search.toLowerCase();
      notes = notes.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (n.checklistItems || []).some(item => item.text.toLowerCase().includes(q))
      );
    }

    // 2. Filter by view
    if (view === 'trash') {
      notes = notes.filter(n => n.isTrashed);
    } else if (view === 'archive') {
      notes = notes.filter(n => !n.isTrashed && n.isArchived);
    } else if (view === 'pinned') {
      notes = notes.filter(n => !n.isTrashed && !n.isArchived && n.isPinned);
    } else if (view === 'career') {
      const careerTags = ['career', 'interview', 'job', 'prep', 'full-stack', 'react'];
      notes = notes.filter(n =>
        !n.isTrashed &&
        (n.tags || []).some(t => careerTags.includes(t.toLowerCase()))
      );
    } else if (tag) {
      notes = notes.filter(n =>
        !n.isTrashed &&
        (n.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase())
      );
    } else if (!view) {
      // default: active notes (non-trashed, non-archived)
      notes = notes.filter(n => !n.isTrashed && !n.isArchived);
    }

    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
}

export async function createNote(req, res) {
  try {
    const noteData = req.body;
    if (!noteData.title && !noteData.content && (!noteData.checklistItems || noteData.checklistItems.length === 0)) {
      return res.status(400).json({ success: false, error: "Note must have title, content, or checklist items" });
    }
    const newNote = await db.createNote(noteData);
    res.status(201).json({ success: true, data: newNote });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ success: false, error: "Failed to create note" });
  }
}

export async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateNote(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ success: false, error: "Failed to update note" });
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const deleted = await db.softDeleteNote(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.json({ success: true, message: "Note moved to trash", data: deleted });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ success: false, error: "Failed to delete note" });
  }
}

export async function restoreNote(req, res) {
  try {
    const { id } = req.params;
    const restored = await db.restoreNote(id);
    if (!restored) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.json({ success: true, message: "Note restored from trash", data: restored });
  } catch (err) {
    console.error("Error restoring note:", err);
    res.status(500).json({ success: false, error: "Failed to restore note" });
  }
}

export async function permanentDeleteNote(req, res) {
  try {
    const { id } = req.params;
    const result = await db.permanentDeleteNoteById(id);
    res.json({ success: true, message: "Note permanently deleted", data: result });
  } catch (err) {
    console.error("Error permanently deleting note:", err);
    res.status(500).json({ success: false, error: "Failed to permanently delete note" });
  }
}

export async function emptyTrash(req, res) {
  try {
    const result = await db.emptyTrash();
    res.json({ success: true, message: "Trash emptied", data: result });
  } catch (err) {
    console.error("Error emptying trash:", err);
    res.status(500).json({ success: false, error: "Failed to empty trash" });
  }
}

export async function duplicateNote(req, res) {
  try {
    const { id } = req.params;
    const clone = await db.duplicateNote(id);
    if (!clone) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.status(201).json({ success: true, data: clone });
  } catch (err) {
    console.error("Error duplicating note:", err);
    res.status(500).json({ success: false, error: "Failed to duplicate note" });
  }
}
