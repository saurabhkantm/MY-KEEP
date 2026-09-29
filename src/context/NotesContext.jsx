import React, { createContext, useContext, useState, useEffect } from "react";

const NotesContext = createContext();

const INITIAL_NOTES = [
  {
    id: "note-welcome",
    title: "🚀 Welcome to KeepAI — Your AI Second Brain",
    content: "KeepAI is a next-generation workspace combining Google Keep's intuitive design with Google Gemini AI.\n\nKey Capabilities:\n• ⚡ AI Summarization & Tone Enhancer\n• 📋 Automatic To-Do Checklist Extractor\n• 🎯 Dedicated Career & Interview Prep Studio\n• 🎙️ Speech-to-Text Voice Dictation\n• 🎨 12 pastel & dark Google Keep themes\n• 💾 100% offline-ready with local storage and JSON backups",
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
    title: "🎯 Senior Frontend Engineer: Interview Prep",
    content: "Core Competencies to Highlight:\n1. Architecture: Vite + React 18, Custom Hooks, Context state colocation, CSS Variables.\n2. AI Integration: Direct Gemini LLM REST calls, structured JSON outputs, streaming UX, robust offline fallbacks.\n3. STAR Story (High Scale Refactor):\n• Situation: Legacy build tool crashed on modern Node environments.\n• Task: Upgrade build pipeline with zero downtime and sub-second HMR.\n• Action: Migrated to Vite 5, replaced CSS float with responsive CSS Grid masonry, implemented accessible modal dialogs.\n• Result: 10x faster build times and zero production regressions.",
    isChecklist: false,
    checklistItems: [],
    color: "coral",
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    tags: ["career", "interview", "react"],
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
      { id: "item-4", text: "Review React 18 hooks & async LLM API patterns", completed: false },
      { id: "item-5", text: "Prepare 3 insightful questions for the engineering manager", completed: false }
    ],
    color: "sage",
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    tags: ["career", "urgent"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "note-ideas",
    title: "💡 System Design: Real-time Collaborative Notes",
    content: "Ideas for scaling a note-taking platform:\n• Conflict-free Replicated Data Types (CRDTs) like Yjs or Automerge for real-time multiplayer.\n• WebSockets for presence and cursor tracking.\n• IndexedDB for high-capacity offline caching with ServiceWorker background sync.\n• Vector embeddings (e.g. Gemini Embeddings) stored in client-side WebAssembly vector DB for instant semantic note retrieval.",
    isChecklist: false,
    checklistItems: [],
    color: "fog",
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    tags: ["ideas", "architecture", "system-design"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("keepai_notes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load notes from localStorage", e);
    }
    return INITIAL_NOTES;
  });

  const [activeView, setActiveView] = useState("notes"); // 'notes' | 'pinned' | 'career' | 'archive' | 'trash' | 'tag:<tagName>'
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("keepai_theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("keepai_gemini_key") || "";
  });

  // Sync notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("keepai_notes", JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes to localStorage", e);
    }
  }, [notes]);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem("keepai_theme", isDarkMode ? "dark" : "light");
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.warn(e);
    }
  }, [isDarkMode]);

  // Sync API Key
  const updateApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("keepai_gemini_key", key);
    } else {
      localStorage.removeItem("keepai_gemini_key");
    }
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // CRUD Note Methods
  const addNote = (newNote) => {
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newNote.title || "",
      content: newNote.content || "",
      isChecklist: Boolean(newNote.isChecklist),
      checklistItems: newNote.checklistItems || [],
      color: newNote.color || "default",
      isPinned: Boolean(newNote.isPinned),
      isArchived: false,
      isTrashed: false,
      tags: newNote.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    return note;
  };

  const updateNote = (id, updatedFields) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (id) => {
    // Soft delete -> move to trash
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isTrashed: true, isPinned: false } : note
      )
    );
  };

  const restoreNote = (id) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isTrashed: false } : note
      )
    );
  };

  const permanentDeleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const emptyTrash = () => {
    setNotes(prev => prev.filter(note => !note.isTrashed));
  };

  const togglePin = (id) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned, isArchived: false } : note
      )
    );
  };

  const toggleArchive = (id) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isArchived: !note.isArchived, isPinned: false } : note
      )
    );
  };

  const duplicateNote = (id) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const clone = {
      ...target,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: target.title ? `${target.title} (Copy)` : "Copy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [clone, ...prev]);
  };

  const setNoteColor = (id, color) => {
    updateNote(id, { color });
  };

  const toggleChecklistItem = (noteId, itemId) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id !== noteId) return note;
        const updatedItems = (note.checklistItems || []).map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...note, checklistItems: updatedItems, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Export / Import JSON
  const exportNotesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `keepai-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importNotesJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setNotes(parsed);
        return { success: true, count: parsed.length };
      }
      return { success: false, error: "Invalid JSON format: Must be an array of notes." };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Dynamic set of unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      if (!note.isTrashed && note.tags) {
        note.tags.forEach(t => tagSet.add(t.toLowerCase()));
      }
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Statistics
  const stats = React.useMemo(() => {
    const nonTrashed = notes.filter(n => !n.isTrashed);
    return {
      total: nonTrashed.filter(n => !n.isArchived).length,
      pinned: nonTrashed.filter(n => n.isPinned && !n.isArchived).length,
      career: nonTrashed.filter(n => (n.tags || []).some(t => ["career", "interview", "job", "resume"].includes(t.toLowerCase()))).length,
      archive: nonTrashed.filter(n => n.isArchived).length,
      trash: notes.filter(n => n.isTrashed).length
    };
  }, [notes]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        toggleSidebar,
        isDarkMode,
        toggleDarkMode,
        apiKey,
        updateApiKey,
        addNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentDeleteNote,
        emptyTrash,
        togglePin,
        toggleArchive,
        duplicateNote,
        setNoteColor,
        toggleChecklistItem,
        exportNotesJson,
        importNotesJson,
        allTags,
        stats
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
