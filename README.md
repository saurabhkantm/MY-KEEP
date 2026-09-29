# 💡 KeepAI — Full-Stack AI Second Brain & Career Workspace

> An enterprise-grade, portfolio-ready Full-Stack application powered by **React 18**, **Vite 5**, **Node.js**, **Express**, and **Google Gemini AI**. Built to showcase decoupled architecture, real-world LLM integration, speech-to-text dictation, and career acceleration tools.

---

## 🌟 Highlights & Full-Stack Innovations

### 1. 🌐 Dedicated Node.js & Express REST API Backend
- **RESTful Endpoints**: Full CRUD operations for notes, checklists, tags, colors, pinning, archiving, and trash.
- **Persistent Storage**: Zero-dependency file-backed JSON database engine (`server/data/notes.json`) that works out of the box, with instant MongoDB Atlas support via `MONGODB_URI`.
- **Health Check & Logging**: `/api/health` endpoint with service uptime and timestamp reporting.
- **Concurrent Dev Environment**: Single-command startup (`npm run dev`) that boots both the Express server on port `5000` and Vite client on port `3000` with hot reload and proxying.

### 2. 🛡️ Secure Server-Side Gemini AI Proxy
- Proxies all LLM requests through secure backend endpoints (`/api/ai/*`) to prevent API key exposure in client-side code:
  - `POST /api/ai/summarize` — Generates executive summaries and key takeaways.
  - `POST /api/ai/extract-checklist` — Converts unstructured text into actionable to-do items.
  - `POST /api/ai/rewrite-tone` — Rewrites into *Professional*, *Executive*, *Concise*, or *Bullets*.
  - `POST /api/ai/career-prep` — Generates STAR interview cheat sheets and technical Q&A.
  - `POST /api/ai/ask-notes` — Semantic Q&A grounded in user notes.
- **Intelligent Offline Fallback**: Generates context-aware realistic outputs when no API key is provided, guaranteeing 100% demo uptime.

### 3. 🎯 Career & Interview Prep Studio (Built for Job Seekers)
- **Turn Job Postings into Interview Gold**: Paste any job title and job description.
- **Tailored AI Output**:
  - 🔑 Core Competencies & Skills breakdown
  - 💡 Anticipated Technical Questions with model talking points
  - ⭐ Behavioral Questions formatted with the **STAR Method** (Situation, Task, Action, Result)
  - 📋 5-Step Action Checklist to ace the interview
- Automatically saves directly to your notes with 1-click and confetti feedback.

### 4. 🎙️ Voice Notes (Hands-Free Speech-to-Text)
- Real-time speech recognition using the browser's native **Web Speech API**.
- Dictate thoughts on the fly with live microphone pulsing animation.

### 5. 🎨 Authentic Google Keep Aesthetics & Theming
- **12 Custom Themes**: Authentic Google Keep pastel palettes with custom dark mode shades.
- **Responsive Masonry Grid**: Multi-column CSS layout that adapts across desktop, tablet, and mobile.
- **Pinned vs Others Priority**: Instant visual separation of high-priority notes.
- **Trash & Archive Life Cycle**: Soft delete to Trash with "Restore" and "Delete Permanently" options.
- **Interactive Checklists**: Strikethrough completed items directly on the card without opening modal.

### 6. 💾 Offline-First Resilience & Data Freedom
- Automatic sync between React state, Express REST API, and browser `localStorage`.
- **JSON Backup & Restore**: Export all notes to JSON or import them anytime.

---

## 🛠️ Full-Stack Tech Stack

- **Backend**: Node.js, Express 5, CORS, Dotenv, REST API
- **Frontend**: React 18.3, Vite 5, Lucide Icons, Canvas Confetti
- **Styling**: Modern CSS Variables, responsive masonry columns, Dark/Light mode tokens
- **AI Integration**: Google Gemini 1.5 Flash (server-side proxy + client fallback)
- **Audio API**: Web Speech API (`SpeechRecognition`)
- **Dev Tooling**: Concurrently, Nodemon, Vite Proxy

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

2. **Start Full-Stack Development (Frontend + Backend concurrently)**:
   ```bash
   npm run dev
   ```
   - Client runs on: [http://localhost:3000](http://localhost:3000)
   - Backend API runs on: [http://localhost:5000](http://localhost:5000)
   - Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📁 Full-Stack Project Structure

```
MY-KEEP/
├── server/
│   ├── index.js               # Express app, middleware, routes, port listener
│   ├── storage/
│   │   └── db.js              # Persistent database storage & auto-seed
│   ├── controllers/
│   │   ├── notesController.js # Notes REST CRUD controllers
│   │   └── aiController.js    # Server-side Gemini AI proxy & smart fallback
│   ├── routes/
│   │   ├── notesRoutes.js     # /api/notes endpoints
│   │   └── aiRoutes.js        # /api/ai endpoints
│   └── data/
│       └── notes.json         # Persistent JSON database store
├── src/
│   ├── index.jsx              # React 18 createRoot mounting
│   ├── App.jsx                # Main application layout and modal container
│   ├── context/
│   │   └── NotesContext.jsx   # State management with backend sync
│   ├── services/
│   │   ├── api.js             # REST API client
│   │   └── geminiService.js   # AI client (calls backend proxy with fallback)
│   ├── styles/
│   │   └── app.css            # Keep color variables, masonry, dark mode
│   └── components/            # React UI components
├── index.html                 # Modern Vite entry HTML
├── vite.config.js             # Vite config with backend proxy (/api -> 5000)
├── package.json               # Full-stack dependencies & scripts
├── .env.example               # Server environment configuration
└── README.md
```

---

## 🎯 Recruiter & Technical Interview Talking Points

- **Decoupled Architecture**: Decoupled React 18 frontend from Express 5 backend with seamless Vite development proxying.
- **Security Best Practices**: API keys are isolated on the server rather than exposed on the frontend client.
- **Resilient Offline-First UX**: Optimistic updates ensure 0ms user perceived latency, with automated sync to the backend database and fallback to `localStorage` if network fails.
- **Role-Aware LLM Conditioning**: Prompt engineering tuned specifically for tech job seekers, generating STAR-method interview cheat sheets and technical Q&A based on job descriptions.