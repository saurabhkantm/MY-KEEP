import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Briefcase,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  BookmarkPlus,
  ArrowLeft,
  RotateCcw,
  ListChecks,
  HelpCircle,
  Award,
  Calendar
} from "lucide-react";
import confetti from "canvas-confetti";
import { useNotes } from "../context/NotesContext";
import { generateCareerPrep } from "../services/geminiService";

export default function CareerPrepModal({ onClose }) {
  const { addNote, apiKey, setActiveView } = useNotes();

  const [step, setStep] = useState("input"); // 'input' | 'generating' | 'preview'
  const [jobTitle, setJobTitle] = useState("AI/ML Application Engineer");
  const [jobDescription, setJobDescription] = useState(
    "Developing production LLM client apps, prompt engineering, structured JSON outputs, streaming tokens, context retrieval, and client-side fallbacks."
  );
  const [generatedGuide, setGeneratedGuide] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    {
      title: "AI/ML Application Engineer",
      desc: "Developing production LLM client apps, prompt engineering, structured JSON outputs, streaming tokens, context retrieval, and client-side fallbacks."
    },
    {
      title: "Senior Frontend Engineer (React/Vite)",
      desc: "Building high-performance React web applications, custom hooks, state colocation, responsive masonry layouts, and integrating Google Gemini AI APIs."
    },
    {
      title: "Full-Stack Web Developer",
      desc: "Design and implement end-to-end full-stack architectures, Node.js REST services, database indexing, user authentication, and interactive frontend dashboards."
    }
  ];

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return;
    setStep("generating");
    setSavedSuccess(false);

    try {
      const guide = await generateCareerPrep(jobTitle, jobDescription, apiKey);
      setGeneratedGuide(guide);
      setStep("preview");
    } catch (e) {
      console.error(e);
      alert("Failed to generate career prep. Please try again.");
      setStep("input");
    }
  };

  const handleSaveToNotes = () => {
    if (!generatedGuide) return;

    addNote({
      title: `🎯 Interview Prep: ${jobTitle}`,
      content: generatedGuide,
      color: "coral",
      isPinned: true,
      tags: ["career", "interview", "prep", jobTitle.toLowerCase().split(" ")[0]]
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore confetti errors
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
      setActiveView("career");
    }, 1100);
  };

  const handleCopy = () => {
    if (!generatedGuide) return;
    navigator.clipboard.writeText(generatedGuide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "780px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}
            >
              <Briefcase size={20} />
            </div>
            <span>Career Hub — Interview & Job Prep Studio</span>
            <span className="career-badge">Portfolio Feature</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {step === "input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Select a preset or paste any target role below. Google Gemini AI analyzes the requirements and generates a complete <strong>STAR-method interview cheat sheet</strong>, technical model answers, and an actionable 5-step checklist!
              </p>

              {/* Quick Role Presets */}
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Quick Role Presets:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {presets.map((p, idx) => {
                    const isSelected = jobTitle === p.title;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="tag-chip"
                        style={{
                          cursor: "pointer",
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                          backgroundColor: isSelected ? "var(--accent-light)" : "var(--bg-surface)",
                          color: isSelected ? "#b45309" : "var(--text-primary)",
                          fontWeight: isSelected ? 600 : 400
                        }}
                        onClick={() => {
                          setJobTitle(p.title);
                          setJobDescription(p.desc);
                        }}
                      >
                        🚀 {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Job Title */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Target Job Title:
                </label>
                <input
                  type="text"
                  className="create-title-input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. AI/ML Application Engineer"
                  style={{
                    border: "1px solid var(--border-color)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-primary)",
                    width: "100%",
                    fontSize: "1rem"
                  }}
                />
              </div>

              {/* Job Requirements Description */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Job Description or Key Requirements:
                </label>
                <textarea
                  className="create-content-input"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste requirements, tech stack, or job posting excerpt..."
                  rows={5}
                  style={{
                    border: "1px solid var(--border-color)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-primary)",
                    width: "100%",
                    fontSize: "0.92rem",
                    lineHeight: "1.5"
                  }}
                />
              </div>
            </div>
          )}

          {step === "generating" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  marginBottom: "20px"
                }}
              >
                <Sparkles size={32} className="pulse-mic" />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                Analyzing Job Requirements...
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px" }}>
                Google Gemini AI is crafting your tailored STAR interview cheat sheet, anticipating technical questions, and building a 5-step preparation roadmap for <strong>{jobTitle}</strong>.
              </p>
            </div>
          )}

          {step === "preview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontWeight: 600, color: "#10b981", fontSize: "0.95rem" }}>
                    Interview Cheat Sheet Generated for {jobTitle}!
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={handleCopy}
                    title="Copy full text"
                  >
                    {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setStep("input")}
                    title="Modify requirements or role"
                  >
                    <RotateCcw size={16} />
                    <span>Edit Inputs</span>
                  </button>
                </div>
              </div>

              {/* Formatted Guide Display */}
              <div
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  fontSize: "0.92rem",
                  lineHeight: "1.65",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "hidden",
                  color: "var(--text-primary)"
                }}
              >
                {generatedGuide}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: "14px 24px" }}>
          {step === "input" && (
            <>
              <button type="button" className="action-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="action-btn ai-glow"
                onClick={handleGenerate}
                disabled={!jobTitle.trim()}
                style={{ padding: "10px 24px" }}
              >
                <Sparkles size={16} />
                <span>Generate Interview Cheat Sheet</span>
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                type="button"
                className="action-btn"
                onClick={() => setStep("input")}
                style={{ marginRight: "auto" }}
              >
                <ArrowLeft size={16} /> Back to Inputs
              </button>
              <button type="button" className="action-btn" onClick={onClose}>
                Dismiss
              </button>
              <button
                type="button"
                className="action-btn primary"
                onClick={handleSaveToNotes}
                disabled={savedSuccess}
                style={{ padding: "10px 24px", fontSize: "0.95rem" }}
              >
                <BookmarkPlus size={18} />
                <span>{savedSuccess ? "Saved to Keep!" : "Save to My Notes"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
