import React from "react";
import {
  Lightbulb,
  Pin,
  Archive,
  Trash2,
  Briefcase,
  Search,
  Sparkles
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";

export default function NoteList({ onEditNote }) {
  const { notes, activeView, searchQuery, emptyTrash } = useNotes();

  // Filter notes based on active view & search
  const filteredNotes = notes.filter((note) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title?.toLowerCase().includes(q);
      const matchContent = note.content?.toLowerCase().includes(q);
      const matchTags = (note.tags || []).some(t => t.toLowerCase().includes(q));
      const matchChecklist = (note.checklistItems || []).some(item =>
        item.text.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchContent && !matchTags && !matchChecklist) {
        return false;
      }
    }

    // 2. View filter
    if (activeView === "trash") {
      return note.isTrashed;
    }
    if (note.isTrashed) return false;

    if (activeView === "archive") {
      return note.isArchived;
    }
    if (note.isArchived) return false;

    if (activeView === "pinned") {
      return note.isPinned;
    }

    if (activeView === "career") {
      const careerTags = ["career", "interview", "job", "resume"];
      return (note.tags || []).some(t => careerTags.includes(t.toLowerCase()));
    }

    if (activeView.startsWith("tag:")) {
      const targetTag = activeView.replace("tag:", "").toLowerCase();
      return (note.tags || []).map(t => t.toLowerCase()).includes(targetTag);
    }

    // Default 'notes' view: non-archived, non-trashed
    return true;
  });

  // Separate pinned vs others in default notes view
  const showSeparatedPinned = activeView === "notes" && !searchQuery.trim();
  const pinnedNotes = showSeparatedPinned ? filteredNotes.filter(n => n.isPinned) : [];
  const otherNotes = showSeparatedPinned ? filteredNotes.filter(n => !n.isPinned) : filteredNotes;

  if (filteredNotes.length === 0) {
    let emptyIcon = Lightbulb;
    let emptyTitle = "No notes yet";
    let emptyDesc = "Notes you add will appear here. Capture your ideas, tasks, and interview prep.";

    if (searchQuery.trim()) {
      emptyIcon = Search;
      emptyTitle = "No matching notes found";
      emptyDesc = `No results found for "${searchQuery}". Try different keywords or check your tags.`;
    } else if (activeView === "trash") {
      emptyIcon = Trash2;
      emptyTitle = "No notes in Trash";
      emptyDesc = "Your trash is clean and tidy!";
    } else if (activeView === "archive") {
      emptyIcon = Archive;
      emptyTitle = "Your archive is empty";
      emptyDesc = "Archived notes are stored here safely out of your main view.";
    } else if (activeView === "career") {
      emptyIcon = Briefcase;
      emptyTitle = "No career prep notes yet";
      emptyDesc = "Click 'Career Hub' in the header to turn any job posting into an interview cheat sheet!";
    } else if (activeView === "pinned") {
      emptyIcon = Pin;
      emptyTitle = "No pinned notes";
      emptyDesc = "Pin important notes to keep them anchored at the top.";
    }

    const Icon = emptyIcon;

    return (
      <div className="empty-state">
        <Icon className="empty-state-icon" />
        <h3 className="empty-state-title">{emptyTitle}</h3>
        <p className="empty-state-desc">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Trash Top Toolbar */}
      {activeView === "trash" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface)",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            marginBottom: "24px"
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Notes in Trash will stay until permanently deleted.
          </span>
          <button
            type="button"
            className="action-btn"
            style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={() => {
              if (window.confirm("Empty trash permanently? This cannot be undone.")) {
                emptyTrash();
              }
            }}
          >
            Empty Trash
          </button>
        </div>
      )}

      {/* Pinned Section */}
      {showSeparatedPinned && pinnedNotes.length > 0 && (
        <section className="notes-section">
          <div className="section-label">PINNED</div>
          <div className="masonry-grid">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEditNote={onEditNote} />
            ))}
          </div>
        </section>
      )}

      {/* Others or Main Section */}
      <section className="notes-section">
        {showSeparatedPinned && pinnedNotes.length > 0 && (
          <div className="section-label">OTHERS</div>
        )}
        <div className="masonry-grid">
          {otherNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEditNote={onEditNote} />
          ))}
        </div>
      </section>
    </div>
  );
}
