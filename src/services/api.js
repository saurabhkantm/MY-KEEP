/**
 * KeepAI - Backend API Client
 * Provides REST API communication with the Express backend
 */

const API_BASE = '/api';

export async function getNotesFromBackend(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/notes${query ? '?' + query : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn("Backend unavailable, using local storage:", err.message);
    return null;
  }
}

export async function createNoteOnBackend(noteData) {
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("Backend create note error:", err.message);
    return null;
  }
}

export async function updateNoteOnBackend(id, updates) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("Backend update note error:", err.message);
    return null;
  }
}

export async function deleteNoteOnBackend(id) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend delete note error:", err.message);
    return null;
  }
}

export async function restoreNoteOnBackend(id) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}/restore`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend restore note error:", err.message);
    return null;
  }
}

export async function permanentDeleteNoteOnBackend(id) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}/permanent`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend permanent delete error:", err.message);
    return null;
  }
}

export async function emptyTrashOnBackend() {
  try {
    const res = await fetch(`${API_BASE}/notes/empty-trash`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend empty trash error:", err.message);
    return null;
  }
}

export async function duplicateNoteOnBackend(id) {
  try {
    const res = await fetch(`${API_BASE}/notes/${id}/duplicate`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("Backend duplicate note error:", err.message);
    return null;
  }
}
