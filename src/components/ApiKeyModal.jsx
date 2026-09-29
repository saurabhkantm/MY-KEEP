import React, { useState } from "react";
import {
  X,
  Key,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function ApiKeyModal({ onClose }) {
  const { apiKey, updateApiKey } = useNotes();
  const [keyInput, setKeyInput] = useState(apiKey || "");
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = () => {
    updateApiKey(keyInput.trim());
    onClose();
  };

  const handleClear = () => {
    setKeyInput("");
    updateApiKey("");
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    if (!keyInput.trim()) {
      setTestStatus("error");
      setErrorMessage("Please enter an API key to test.");
      return;
    }

    setTestStatus("testing");
    setErrorMessage("");

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyInput.trim()}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Say 'OK'" }] }]
        })
      });

      if (res.ok) {
        setTestStatus("success");
      } else {
        const errorData = await res.text();
        setTestStatus("error");
        setErrorMessage(`Invalid API key or rate limited (${res.status}).`);
      }
    } catch (e) {
      setTestStatus("error");
      setErrorMessage("Network error verifying API key.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Key size={20} color="var(--accent)" />
            <span>Google Gemini API Settings</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}
          >
            <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.85rem", lineHeight: "1.45", color: "var(--text-primary)" }}>
              <strong>Demo-Ready Failsafe:</strong> If you don't have an API key, KeepAI seamlessly uses its built-in <strong>Smart AI Engine</strong> so all AI summaries, to-do extractions, and interview prep features continue to work out of the box!
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Google Gemini API Key:
            </label>
            <input
              type="password"
              className="create-title-input"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setTestStatus(null);
              }}
              placeholder="AIzaSy..."
              style={{
                border: "1px solid var(--border-color)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-primary)",
                width: "100%",
                fontSize: "0.95rem"
              }}
            />
          </div>

          {testStatus === "testing" && (
            <div style={{ fontSize: "0.85rem", color: "#6366f1" }}>Verifying key with Gemini API...</div>
          )}
          {testStatus === "success" && (
            <div style={{ fontSize: "0.85rem", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={16} /> API Key verified successfully!
            </div>
          )}
          {testStatus === "error" && (
            <div style={{ fontSize: "0.85rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Get a free API key at Google AI Studio <ExternalLink size={14} />
            </a>

            <button
              type="button"
              className="action-btn"
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !keyInput.trim()}
            >
              Test Key
            </button>
          </div>
        </div>

        <div className="modal-footer">
          {apiKey && (
            <button
              type="button"
              className="action-btn"
              onClick={handleClear}
              style={{ marginRight: "auto", color: "var(--danger)", borderColor: "var(--danger)" }}
            >
              Remove Key
            </button>
          )}
          <button type="button" className="action-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="action-btn primary" onClick={handleSave}>
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
