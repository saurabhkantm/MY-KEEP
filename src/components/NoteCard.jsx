import React, { useState } from "react";
import {
  Pin,
  Palette,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  CheckSquare
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import ColorPicker from "./ColorPicker";
import {
  summarizeContent,
  extractActionItems,
  rewriteTone
} from "../services/geminiService";

export default function NoteCard({ note, onEditNote }) {
  const {
    togglePin,
    toggleArchive,
    deleteNote,
    restoreNote,
    permanentDeleteNote,
    duplicateNote,
    setNoteColor,
    toggleChecklistItem,
    updateNote,
    setActiveView,
    isDarkMode,
    apiKey
  } = useNotes();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    let text = note.title ? `${note.title}\n\n` : "";
    if (note.isChecklist) {
      text += (note.checklistItems || [])
        .map(i => `[${i.completed ? "x" : " "}] ${i.text}`)
        .join("\n");
    } else {
      text += note.content || "";
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleAiSummarize = async (e) => {
    e.stopPropagation();
    setIsAiProcessing(true);
    setShowAiMenu(false);
    try {
      const summary = await summarizeContent(note.title, note.content, apiKey);
      updateNote(note.id, {
        content: `${note.content}\n\n${summary}`
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiExtractChecklist = async (e) => {
    e.stopPropagation();
    if (!note.content) return;
    setIsAiProcessing(true);
    setShowAiMenu(false);
    try {
      const items = await extractActionItems(note.content, apiKey);
      if (items && items.length > 0) {
        updateNote(note.id, {
          isChecklist: true,
          checklistItems: [...(note.checklistItems || []), ...items]
        });
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTone = async (tone, e) => {
    e.stopPropagation();
    if (!note.content) return;
    setIsAiProcessing(true);
    setShowAiMenu(false);
    try {
      const rewritten = await rewriteTone(note.content, tone, apiKey);
      updateNote(note.id, { content: rewritten });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;
    if (diffHours < 1) return "Edited just now";
    if (diffHours < 24) return `Edited ${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`note-card color-${note.color || "default"}`}
      onClick={() => onEditNote(note)}
    >
      <div className="card-header">
        {note.title && <h3 className="card-title">{note.title}</h3>}
        {!note.isTrashed && (
          <button
            type="button"
            className={`pin-btn ${note.isPinned ? "pinned" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note.id);
            }}
            title={note.isPinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={16} />
          </button>
        )}
      </div>

      {note.isChecklist ? (
        <div className="checklist-builder" style={{ marginBottom: "8px" }}>
          {(note.checklistItems || []).slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="checklist-item-row"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklistItem(note.id, item.id)}
                className="checklist-checkbox"
              />
              <span className={`checklist-text ${item.completed ? "completed" : ""}`}>
                {item.text}
              </span>
            </div>
          ))}
          {(note.checklistItems || []).length > 8 && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              +{note.checklistItems.length - 8} more items...
            </span>
          )}
        </div>
      ) : (
        note.content && <p className="card-content">{note.content}</p>
      )}

      {/* Tags Chips */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags-row" style={{ margin: "6px 0 10px" }}>
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="tag-chip"
              onClick={(e) => {
                e.stopPropagation();
                setActiveView(`tag:${tag}`);
              }}
              title={`Filter by #${tag}`}
              style={{ cursor: "pointer" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="card-date">{formatDate(note.updatedAt || note.createdAt)}</div>

        {/* Hover Actions Toolbar */}
        <div className="card-actions-bar" onClick={(e) => e.stopPropagation()}>
          {note.isTrashed ? (
            <>
              <button
                type="button"
                className="icon-btn"
                title="Restore note"
                onClick={() => restoreNote(note.id)}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Delete forever"
                onClick={() => permanentDeleteNote(note.id)}
                style={{ color: "var(--danger)" }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="card-actions-left">
                <button
                  type="button"
                  className="icon-btn"
                  title="Change color"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette size={16} />
                </button>

                {showColorPicker && (
                  <ColorPicker
                    selectedColor={note.color}
                    onSelect={(c) => {
                      setNoteColor(note.id, c);
                      setShowColorPicker(false);
                    }}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowColorPicker(false)}
                  />
                )}

                {/* AI Menu button */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="icon-btn"
                    title="AI Smart Assistant"
                    onClick={() => setShowAiMenu(!showAiMenu)}
                    style={{ color: "#8b5cf6" }}
                  >
                    <Sparkles size={16} />
                  </button>

                  {showAiMenu && (
                    <div
                      className="color-palette-popover"
                      style={{
                        width: "210px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "8px",
                        left: 0
                      }}
                    >
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={handleAiSummarize}
                        disabled={isAiProcessing}
                      >
                        ⚡ Summarize
                      </button>
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={handleAiExtractChecklist}
                        disabled={isAiProcessing || !note.content}
                      >
                        📋 Extract Checklist
                      </button>
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={(e) => handleAiTone("professional", e)}
                        disabled={isAiProcessing || !note.content}
                      >
                        💼 Professional Tone
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  title={note.isArchived ? "Unarchive" : "Archive"}
                  onClick={() => toggleArchive(note.id)}
                >
                  {note.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  title="Make a copy"
                  onClick={() => duplicateNote(note.id)}
                >
                  <Copy size={16} />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  title={copied ? "Copied!" : "Copy to clipboard"}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <CheckSquare size={16} />}
                </button>
              </div>

              <button
                type="button"
                className="icon-btn"
                title="Delete note"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
