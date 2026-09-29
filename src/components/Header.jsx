import React, { useRef } from "react";
import {
  Menu,
  Search,
  X,
  Sparkles,
  Briefcase,
  Sun,
  Moon,
  Key,
  Download,
  Upload,
  Lightbulb
} from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function Header({
  onOpenAskAi,
  onOpenCareerPrep,
  onOpenApiKeyModal
}) {
  const {
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    isDarkMode,
    toggleDarkMode,
    exportNotesJson,
    importNotesJson,
    apiKey
  } = useNotes();

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const res = importNotesJson(content);
        if (res.success) {
          alert(`Successfully imported ${res.count} notes!`);
        } else {
          alert(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="icon-btn"
          onClick={toggleSidebar}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="logo-badge" onClick={() => window.location.reload()}>
          <div className="logo-icon">
            <Lightbulb size={22} />
          </div>
          <span className="logo-title">
            Keep<span className="logo-ai-tag">AI</span>
          </span>
        </div>
      </div>

      <div className="header-search">
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes, checklists, or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          className="action-btn ai-glow"
          onClick={onOpenAskAi}
          title="Chat with your notes using AI"
        >
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>

        <button
          className="action-btn primary"
          onClick={onOpenCareerPrep}
          title="Generate Interview & Job Prep Notes"
        >
          <Briefcase size={16} />
          <span>Career Hub</span>
        </button>

        <button
          className="icon-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="icon-btn"
          onClick={onOpenApiKeyModal}
          title={apiKey ? "Gemini API Configured" : "Configure Gemini API Key"}
          style={apiKey ? { color: "#10b981" } : {}}
        >
          <Key size={20} />
        </button>

        <button
          className="icon-btn"
          onClick={exportNotesJson}
          title="Export Notes as JSON Backup"
        >
          <Download size={20} />
        </button>

        <button
          className="icon-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Import Notes from JSON Backup"
        >
          <Upload size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handleFileUpload}
        />
      </div>
    </header>
  );
}
