import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Plus,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { askNotes } from "../services/geminiService";

export default function AskNotesModal({ onClose }) {
  const { notes, apiKey, addNote } = useNotes();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your KeepAI Copilot. Ask me anything across all your saved notes, to-dos, and interview cheat sheets!"
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await askNotes(textToSend, notes, apiKey);
      setMessages(prev => [...prev, { role: "assistant", text: response }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Sorry, I encountered an issue querying your notes. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsNote = (answerText) => {
    addNote({
      title: "🤖 AI Note Insights",
      content: answerText,
      color: "fog",
      tags: ["ai-insights", "notes"]
    });
    alert("Saved as a new note to your board!");
  };

  const samplePrompts = [
    "What tasks do I have pending?",
    "Summarize my interview prep notes",
    "What project ideas have I saved?",
    "Give me key takeaways from my notes"
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px", height: "80vh" }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}
            >
              <Sparkles size={18} />
            </div>
            <span>Ask My Notes — AI Search & Chat</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Message Thread */}
        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start"
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  fontSize: "0.95rem",
                  lineHeight: "1.55",
                  whiteSpace: "pre-wrap",
                  backgroundColor:
                    m.role === "user"
                      ? "var(--accent)"
                      : "var(--bg-primary)",
                  color:
                    m.role === "user"
                      ? "#ffffff"
                      : "var(--text-primary)",
                  border: m.role === "assistant" ? "1px solid var(--border-color)" : "none"
                }}
              >
                {m.text}
              </div>

              {m.role === "assistant" && idx > 0 && (
                <button
                  type="button"
                  className="action-btn"
                  style={{ marginTop: "6px", fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => handleSaveAsNote(m.text)}
                  title="Save this answer as a new note card"
                >
                  <Plus size={12} />
                  Save as Note
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b5cf6", fontSize: "0.9rem" }}>
              <Sparkles size={16} className="pulse-mic" />
              <span>Scanning notes & synthesizing answer with AI...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div style={{ padding: "0 24px 10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              className="tag-chip"
              style={{ cursor: "pointer", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}
              onClick={() => handleSend(p)}
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <div className="modal-footer" style={{ padding: "14px 20px" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: "flex", width: "100%", gap: "10px", margin: 0, padding: 0, background: "transparent", boxShadow: "none" }}
          >
            <input
              type="text"
              placeholder="Ask a question about your notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "9999px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.95rem"
              }}
            />
            <button
              type="submit"
              className="action-btn primary"
              disabled={loading || !query.trim()}
              style={{ borderRadius: "9999px", padding: "10px 18px" }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
