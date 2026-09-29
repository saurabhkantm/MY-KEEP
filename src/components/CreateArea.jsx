import React, { useState, useRef, useEffect } from "react";
import {
  CheckSquare,
  Palette,
  Pin,
  Sparkles,
  Mic,
  MicOff,
  Plus,
  X,
  FileText,
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

export default function CreateArea() {
  const { addNote, isDarkMode, apiKey } = useNotes();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [color, setColor] = useState("default");
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (title.trim() || content.trim() || checklistItems.length > 0) {
          handleSave();
        } else {
          handleReset();
        }
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, title, content, checklistItems, color, isPinned, tags, isChecklist]);

  // Handle Speech-to-Text Voice Recording
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim() && checklistItems.length === 0) {
      handleReset();
      return;
    }

    addNote({
      title: title.trim(),
      content: content.trim(),
      isChecklist,
      checklistItems,
      color,
      isPinned,
      tags
    });

    handleReset();
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setChecklistItems([]);
    setNewChecklistText("");
    setColor("default");
    setIsPinned(false);
    setTags([]);
    setTagInput("");
    setIsExpanded(false);
    setShowColorPicker(false);
    setAiMenuOpen(false);
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
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
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleChecklistStatus = (id) => {
    setChecklistItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // AI Actions inside Create Area
  const handleAiSummarize = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsAiLoading(true);
    setAiMenuOpen(false);
    try {
      const summary = await summarizeContent(title, content, apiKey);
      setContent(prev => (prev ? `${prev}\n\n${summary}` : summary));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiExtractTodos = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiMenuOpen(false);
    try {
      const items = await extractActionItems(content, apiKey);
      if (items && items.length > 0) {
        setIsChecklist(true);
        setChecklistItems(prev => [...prev, ...items]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiRewriteTone = async (tone) => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiMenuOpen(false);
    try {
      const rewritten = await rewriteTone(content, tone, apiKey);
      setContent(rewritten);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiAutoTag = async () => {
    setIsAiLoading(true);
    setAiMenuOpen(false);
    try {
      const suggested = await generateAutoTags(title, content, apiKey);
      if (suggested && suggested.length > 0) {
        setTags(prev => [...new Set([...prev, ...suggested])]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="create-area-wrapper" ref={containerRef}>
      <div className={`create-area-card ${isExpanded ? "focused" : ""}`}>
        {!isExpanded ? (
          <div className="create-collapsed" onClick={() => setIsExpanded(true)}>
            <span className="create-collapsed-placeholder">Take a note...</span>
            <div className="create-collapsed-actions">
              <button
                type="button"
                className="icon-btn"
                title="New list"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChecklist(true);
                  setIsExpanded(true);
                }}
              >
                <CheckSquare size={18} />
              </button>

              <button
                type="button"
                className={`icon-btn ${isRecording ? "pulse-mic" : ""}`}
                title="Voice Note (Speech to text)"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  toggleRecording();
                }}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="create-expanded-title">
              <input
                type="text"
                placeholder="Title"
                className="create-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus={!isChecklist}
              />
              <button
                type="button"
                className={`pin-btn ${isPinned ? "pinned" : ""}`}
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin size={18} />
              </button>
            </div>

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
                    <span className={`checklist-text ${item.completed ? "completed" : ""}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      className="tag-chip-remove"
                      onClick={() => removeChecklistItem(item.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="checklist-item-row">
                  <Plus size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Add checklist item... (Press Enter)"
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
                placeholder="Take a note... (Click AI button below for smart actions)"
                className="create-content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            )}

            {/* Tag Chips Row */}
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

            {/* Action Toolbar */}
            <div className="create-toolbar">
              <div className="toolbar-left">
                <button
                  type="button"
                  className="icon-btn"
                  title="Color palette"
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
                  title={isChecklist ? "Switch to Text Note" : "Switch to Checklist"}
                  onClick={() => setIsChecklist(!isChecklist)}
                >
                  {isChecklist ? <FileText size={18} /> : <CheckSquare size={18} />}
                </button>

                <button
                  type="button"
                  className={`icon-btn ${isRecording ? "pulse-mic" : ""}`}
                  title={isRecording ? "Stop voice recording" : "Dictate with voice"}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* AI Assistant Menu */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="icon-btn"
                    title="AI Smart Actions"
                    onClick={() => setAiMenuOpen(!aiMenuOpen)}
                    style={{ color: "#8b5cf6" }}
                  >
                    <Sparkles size={18} />
                  </button>

                  {aiMenuOpen && (
                    <div
                      className="color-palette-popover"
                      style={{
                        width: "220px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "8px"
                      }}
                    >
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={handleAiSummarize}
                        disabled={isAiLoading}
                      >
                        ⚡ Summarize Content
                      </button>
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={handleAiExtractTodos}
                        disabled={isAiLoading}
                      >
                        📋 Extract To-Do Checklist
                      </button>
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={() => handleAiRewriteTone("professional")}
                        disabled={isAiLoading}
                      >
                        💼 Professional Tone
                      </button>
                      <button
                        type="button"
                        className="ai-action-chip"
                        onClick={handleAiAutoTag}
                        disabled={isAiLoading}
                      >
                        🏷️ Auto-Generate Tags
                      </button>
                    </div>
                  )}
                </div>

                {isAiLoading && (
                  <span style={{ fontSize: "0.75rem", color: "#8b5cf6", marginLeft: "4px" }}>
                    AI thinking...
                  </span>
                )}
              </div>

              <div className="toolbar-right">
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={handleSave}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
