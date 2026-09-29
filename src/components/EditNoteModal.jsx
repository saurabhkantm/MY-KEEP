import React, { useState, useEffect } from "react";
import {
  X,
  Pin,
  Palette,
  CheckSquare,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Tag
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import ColorPicker from "./ColorPicker";
import {
  summarizeContent,
  extractActionItems,
  rewriteTone,
  generateAutoTags
} from "../services/geminiService";

export default function EditNoteModal({ note, onClose }) {
  const { updateNote, deleteNote, isDarkMode, apiKey } = useNotes();

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isChecklist, setIsChecklist] = useState(Boolean(note?.isChecklist));
  const [checklistItems, setChecklistItems] = useState(note?.checklistItems || []);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [color, setColor] = useState(note?.color || "default");
  const [isPinned, setIsPinned] = useState(Boolean(note?.isPinned));
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleSaveAndClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, checklistItems, color, isPinned, tags, isChecklist]);

  if (!note) return null;

  const handleSaveAndClose = () => {
    updateNote(note.id, {
      title: title.trim(),
      content: content.trim(),
      isChecklist,
      checklistItems,
      color,
      isPinned,
      tags
    });
    onClose();
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random()}`, text: newChecklistText.trim(), completed: false }
    ]);
    setNewChecklistText("");
  };

  const removeChecklistItem = (id) => {
    setChecklistItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleChecklistStatus = (id) => {
    setChecklistItems(prev =>
      prev.map(i => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag]);
    }
    setTagInput("");
  };

  const removeTag = (t) => {
    setTags(prev => prev.filter(tag => tag !== t));
  };

  // AI Helpers
  const handleAiSummarize = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsAiLoading(true);
    setAiMessage("Generating summary...");
    try {
      const summary = await summarizeContent(title, content, apiKey);
      setContent(prev => (prev ? `${prev}\n\n${summary}` : summary));
      setAiMessage("Summary appended!");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(""), 2500);
    }
  };

  const handleAiExtractChecklist = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiMessage("Extracting to-do tasks...");
    try {
      const items = await extractActionItems(content, apiKey);
      if (items && items.length > 0) {
        setIsChecklist(true);
        setChecklistItems(prev => [...prev, ...items]);
        setAiMessage(`Extracted ${items.length} checklist items!`);
      }
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(""), 2500);
    }
  };

  const handleAiTone = async (tone) => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiMessage(`Rewriting in ${tone} tone...`);
    try {
      const rewritten = await rewriteTone(content, tone, apiKey);
      setContent(rewritten);
      setAiMessage("Tone polished!");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(""), 2500);
    }
  };

  const handleAiAutoTag = async () => {
    setIsAiLoading(true);
    setAiMessage("Generating tags...");
    try {
      const suggested = await generateAutoTags(title, content, apiKey);
      if (suggested && suggested.length > 0) {
        setTags(prev => [...new Set([...prev, ...suggested])]);
        setAiMessage(`Added #${suggested.join(", #")}!`);
      }
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(""), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleSaveAndClose}>
      <div
        className={`modal-content color-${color}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px" }}
      >
        <div className="modal-header">
          <input
            type="text"
            className="create-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: "1.25rem" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              className={`pin-btn ${isPinned ? "pinned" : ""}`}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin size={20} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handleSaveAndClose}
              title="Close & Save"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {isChecklist ? (
            <div className="checklist-builder">
              {checklistItems.map((item) => (
                <div key={item.id} className="checklist-item-row">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistStatus(item.id)}
                    className="checklist-checkbox"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChecklistItems(prev =>
                        prev.map(i => (i.id === item.id ? { ...i, text: val } : i))
                      );
                    }}
                    className={`checklist-text ${item.completed ? "completed" : ""}`}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      width: "100%"
                    }}
                  />
                  <button
                    type="button"
                    className="tag-chip-remove"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="checklist-item-row" style={{ marginTop: "8px" }}>
                <Plus size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Add item (Press Enter)"
                  className="checklist-new-item-input"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <textarea
              className="create-content-input"
              placeholder="Note content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              style={{ minHeight: "160px" }}
            />
          )}

          {/* Tags row */}
          <div className="note-tags-row">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Tag size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="+tag"
                className="add-tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                onBlur={handleAddTag}
              />
            </div>
          </div>

          {/* AI Copilot Panel */}
          <div className="ai-assistant-panel">
            <div className="ai-assistant-header">
              <Sparkles size={16} />
              <span>AI Copilot & Enhancements</span>
              {aiMessage && (
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#10b981" }}>
                  {aiMessage}
                </span>
              )}
            </div>
            <div className="ai-chips-row">
              <button
                type="button"
                className="ai-action-chip"
                onClick={handleAiSummarize}
                disabled={isAiLoading}
              >
                ⚡ Summarize
              </button>
              <button
                type="button"
                className="ai-action-chip"
                onClick={handleAiExtractChecklist}
                disabled={isAiLoading || !content.trim()}
              >
                📋 Extract Checklist
              </button>
              <button
                type="button"
                className="ai-action-chip"
                onClick={() => handleAiTone("professional")}
                disabled={isAiLoading || !content.trim()}
              >
                💼 Professional
              </button>
              <button
                type="button"
                className="ai-action-chip"
                onClick={() => handleAiTone("bullets")}
                disabled={isAiLoading || !content.trim()}
              >
                📝 Bullet Points
              </button>
              <button
                type="button"
                className="ai-action-chip"
                onClick={() => handleAiTone("executive")}
                disabled={isAiLoading || !content.trim()}
              >
                👔 Executive Brief
              </button>
              <button
                type="button"
                className="ai-action-chip"
                onClick={handleAiAutoTag}
                disabled={isAiLoading}
              >
                🏷️ Auto-Tags
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              className="icon-btn"
              title="Note Color"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Palette size={18} />
            </button>

            {showColorPicker && (
              <ColorPicker
                selectedColor={color}
                onSelect={(c) => {
                  setColor(c);
                  setShowColorPicker(false);
                }}
                isDarkMode={isDarkMode}
                onClose={() => setShowColorPicker(false)}
              />
            )}

            <button
              type="button"
              className="icon-btn"
              title={isChecklist ? "Switch to Text" : "Switch to Checklist"}
              onClick={() => setIsChecklist(!isChecklist)}
            >
              {isChecklist ? <FileText size={18} /> : <CheckSquare size={18} />}
            </button>

            <button
              type="button"
              className="icon-btn"
              title="Delete Note"
              onClick={() => {
                deleteNote(note.id);
                onClose();
              }}
              style={{ color: "var(--danger)" }}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <button
            type="button"
            className="action-btn primary"
            onClick={handleSaveAndClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
