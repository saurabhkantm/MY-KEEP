import React from "react";
import {
  Lightbulb,
  Pin,
  Briefcase,
  Archive,
  Trash2,
  Tag,
  Hash
} from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function Sidebar() {
  const {
    notes,
    activeView,
    setActiveView,
    sidebarOpen,
    allTags,
    stats
  } = useNotes();

  const navItems = [
    { id: "notes", label: "Notes", icon: Lightbulb, count: stats.total },
    { id: "pinned", label: "Pinned", icon: Pin, count: stats.pinned },
    { id: "career", label: "Career & Jobs", icon: Briefcase, count: stats.career },
    { id: "archive", label: "Archive", icon: Archive, count: stats.archive },
    { id: "trash", label: "Trash", icon: Trash2, count: stats.trash }
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.count > 0 && (
                <span className="nav-item-badge">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {sidebarOpen && allTags.length > 0 && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section-title">Labels & Tags</div>
          <div className="tags-list">
            {allTags.map((tag) => {
              const tagViewId = `tag:${tag}`;
              const isActive = activeView === tagViewId;
              const count = notes.filter(
                (n) => !n.isTrashed && (n.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase())
              ).length;
              return (
                <button
                  key={tag}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveView(tagViewId)}
                  title={`Tag: ${tag}`}
                >
                  <Tag size={16} />
                  <span>{tag}</span>
                  {sidebarOpen && count > 0 && (
                    <span className="nav-item-badge">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
