# 💡 KeepAI — Intelligent AI Second Brain & Career Workspace

> An enterprise-grade, portfolio-ready Google Keep evolution powered by **React 18**, **Vite 5**, and **Google Gemini AI**. Built to showcase modern frontend architecture, real-world LLM integration, speech-to-text dictation, and career acceleration tools.

---

## 🌟 Highlights & Key Innovations

### 1. 🎯 Career & Interview Prep Studio (Built for Job Seekers)
- **Turn Job Postings into Interview Gold**: Paste any job title and job description (from LinkedIn, Indeed, etc.).
- **Tailored AI Output**:
  - 🔑 Core Competencies & Skills gap breakdown
  - 💡 Anticipated Technical Questions with model talking points
  - ⭐ Behavioral Questions formatted with the **STAR Method** (Situation, Task, Action, Result)
  - 📋 5-Step Action Checklist to ace the interview
- Automatically saves directly to your notes with 1-click and confetti feedback.

### 2. ⚡ AI Note Copilot (Powered by Google Gemini 1.5 Flash)
- **Auto-Summarization**: Condense long notes, meeting logs, or study guides into concise executive summaries.
- **Action Item / Checklist Extractor**: Automatically detects tasks in raw unstructured text and converts them into interactive to-do checkboxes.
- **Tone Polish & Rewriter**: Switch notes into *Professional*, *Executive Briefing*, *Concise*, or *Bullet Points* with one click.
- **Auto-Tagging**: Semantic topic analysis suggests relevant `#tags`.
- **"Ask My Notes"**: An interactive AI chat assistant that searches and queries across your entire personal knowledge base.

### 3. 🎙️ Voice Notes (Hands-Free Speech-to-Text)
- Real-time speech recognition using the browser's native **Web Speech API**.
- Dictate thoughts on the fly with live microphone pulsing animation.

### 4. 🎨 Authentic Google Keep Aesthetics & Theming
- **12 Custom Themes**: Authentic Google Keep pastel palettes (Default, Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk) with custom dark mode shades.
- **Responsive Masonry Grid**: Multi-column CSS layout that adapts across desktop, tablet, and mobile without overlapping or layout breaks.
- **Pinned vs Others Priority**: Instant visual separation of high-priority notes.
- **Trash & Archive Life Cycle**: Soft delete to Trash with "Restore" and "Delete Permanently" options, plus Archive view.
- **Interactive Checklists**: Strikethrough completed items directly on the card without opening modal.
- **Full-Screen Edit Modal**: Focus editor with auto-save on close (`Esc` or backdrop click).

### 5. 🛡️ Resilient Dual-Engine AI (100% Demo-Ready)
- **Google Gemini API Key Support**: Configure your own free API key from Google AI Studio.
- **Smart Offline Fallback Engine**: If no API key is provided, an internal context-aware AI engine generates realistic summaries, checklists, and interview guides — ensuring the demo **never fails** in front of recruiters or interviewers!

### 6. 💾 Local-First Persistence & Data Freedom
- Instant auto-save to browser `localStorage`.
- **JSON Backup & Restore**: Export all notes to JSON or import them anytime.

---

## 🛠️ Tech Stack

- **Framework**: React 18.3 (Hooks, Context API, state colocation)
- **Bundler & Tooling**: Vite 5 (Sub-second HMR, modern ES modules, Node 24 compatible)
- **Styling**: Modern CSS Variables, responsive masonry columns, glassmorphism, Dark/Light mode tokens
- **AI Integration**: Google Gemini REST API (`gemini-1.5-flash`)
- **Audio API**: Web Speech API (`SpeechRecognition`)
- **Icons**: Lucide React
- **Micro-interactions**: Canvas Confetti, smooth CSS cubic-bezier transitions

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18+` (Tested and verified on Node.js `v24.20.0`)
- npm `v9+`

### Installation & Launch

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
MY-KEEP/
├── index.html                 # Modern Vite entry HTML with Google Fonts
├── vite.config.js             # Vite configuration
├── package.json               # Modern dependencies (React 18, Vite, Lucide)
├── src/
│   ├── index.jsx              # React 18 createRoot mounting
│   ├── App.jsx                # Main application layout and modal container
│   ├── context/
│   │   └── NotesContext.jsx   # State management, local storage, CRUD & tags
│   ├── services/
│   │   └── geminiService.js   # Gemini REST client & smart fallback engine
│   ├── styles/
│   │   └── app.css            # Keep color variables, masonry, dark mode
│   └── components/
│       ├── Header.jsx         # Search, AI Chat, Career Hub, Theme & Backup
│       ├── Sidebar.jsx        # Navigation views, badges, and tag filters
│       ├── CreateArea.jsx     # Expandable creator, voice dictation, checklists
│       ├── NoteCard.jsx       # Google Keep card with hover tools & colors
│       ├── NoteList.jsx       # Masonry grid (Pinned & Others)
│       ├── EditNoteModal.jsx  # Focused modal editor with AI Copilot panel
│       ├── AskNotesModal.jsx  # "Ask My Notes" chat interface
│       ├── CareerPrepModal.jsx# AI Job Description to Interview Cheat Sheet
│       ├── ApiKeyModal.jsx    # Google Gemini API key configuration
│       └── ColorPicker.jsx    # 12 Google Keep color swatches
└── README.md
```

---

## 🎯 Recruiter & Interview Talking Points

- **Why Vite instead of Create-React-App?** CRA uses outdated Webpack 4 dependencies that fail on modern Node (OpenSSL 3+). Vite provides sub-second startup, roll-up based builds, and native ESM.
- **State Architecture**: Uses React Context with `useMemo` optimizations for tag extraction, filtered searches, and seamless persistence to `localStorage`.
- **Defensive LLM Integration**: Implemented a dual-layer AI strategy with prompt engineering, structured JSON extraction for checklists, and an intelligent offline fallback engine to guarantee zero downtime during demos.