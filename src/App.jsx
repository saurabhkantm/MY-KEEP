import React, { useState } from "react";
import { NotesProvider, useNotes } from "./context/NotesContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CreateArea from "./components/CreateArea";
import NoteList from "./components/NoteList";
import EditNoteModal from "./components/EditNoteModal";
import AskNotesModal from "./components/AskNotesModal";
import CareerPrepModal from "./components/CareerPrepModal";
import ApiKeyModal from "./components/ApiKeyModal";
import "./styles/app.css";

function AppContent() {
  const { activeView } = useNotes();
  const [editingNote, setEditingNote] = useState(null);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isCareerPrepOpen, setIsCareerPrepOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Show CreateArea in notes, career, pinned, or tag views (hide in archive/trash)
  const showCreateArea = activeView !== "trash" && activeView !== "archive";

  return (
    <div className="app-container">
      <Header
        onOpenAskAi={() => setIsAskAiOpen(true)}
        onOpenCareerPrep={() => setIsCareerPrepOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <div className="main-layout">
        <Sidebar />

        <main className="content-area">
          {showCreateArea && <CreateArea />}
          <NoteList onEditNote={(note) => setEditingNote(note)} />
        </main>
      </div>

      {/* Modals */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
        />
      )}

      {isAskAiOpen && (
        <AskNotesModal onClose={() => setIsAskAiOpen(false)} />
      )}

      {isCareerPrepOpen && (
        <CareerPrepModal onClose={() => setIsCareerPrepOpen(false)} />
      )}

      {isApiKeyModalOpen && (
        <ApiKeyModal onClose={() => setIsApiKeyModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <NotesProvider>
      <AppContent />
    </NotesProvider>
  );
}
