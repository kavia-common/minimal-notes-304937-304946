import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/theme.css";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NoteList from "./components/NoteList";
import Editor from "./components/Editor";
import { deleteNote, getNotes, saveNotes, upsertNote } from "./lib/storage";

/**
 * @param {string} q
 * @returns {string}
 */
function normalizeQuery(q) {
  return (q || "").trim().toLowerCase();
}

/**
 * @param {any} n
 * @param {string} q
 * @returns {boolean}
 */
function matchesQuery(n, q) {
  if (!q) return true;
  const t = (n.title || "").toLowerCase();
  const c = (n.content || "").toLowerCase();
  return t.includes(q) || c.includes(q);
}

/**
 * Basic small-screen detection for header label tweaks.
 * @returns {boolean}
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia && window.matchMedia("(max-width: 900px)").matches);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 900px)");
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  return isMobile;
}

// PUBLIC_INTERFACE
export default function App() {
  /** Main app component hosting state and composition. */
  const isMobile = useIsMobile();

  const [notes, setNotes] = useState(() => getNotes());
  const [selectedId, setSelectedId] = useState(() => (getNotes()[0]?.id ? getNotes()[0].id : null));
  const [mode, setMode] = useState(() => (getNotes().length ? "edit" : "none")); // "new" | "edit" | "none"
  const [search, setSearch] = useState("");
  const [editorDirty, setEditorDirty] = useState(false);

  // Keep in sync with localStorage whenever notes change.
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Ensure selection is valid when notes array changes
  useEffect(() => {
    if (notes.length === 0) {
      setSelectedId(null);
      setMode("none");
      return;
    }
    if (!selectedId || !notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0].id);
      setMode("edit");
    }
  }, [notes, selectedId]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const query = useMemo(() => normalizeQuery(search), [search]);
  const filteredNotes = useMemo(() => notes.filter((n) => matchesQuery(n, query)), [notes, query]);

  const listEmptyState = useMemo(() => {
    if (notes.length === 0) {
      return {
        title: "No notes yet",
        description: "Create your first note with “New Note”. Notes are saved to localStorage.",
      };
    }
    if (filteredNotes.length === 0) {
      return {
        title: "No matches",
        description: "Try a different search or clear the query.",
      };
    }
    return { title: "", description: "" };
  }, [notes.length, filteredNotes.length]);

  const handleSelect = useCallback(
    (id) => {
      if (editorDirty) {
        const ok = window.confirm("You have unsaved changes. Switch notes anyway?");
        if (!ok) return;
      }
      setSelectedId(id);
      setMode("edit");
    },
    [editorDirty]
  );

  const handleNew = useCallback(() => {
    if (editorDirty) {
      const ok = window.confirm("You have unsaved changes. Discard them and create a new note?");
      if (!ok) return;
    }
    setSelectedId(null);
    setMode("new");
    setEditorDirty(false);
  }, [editorDirty]);

  const handleSave = useCallback(
    (draft) => {
      const { notes: next, note } = upsertNote(notes, draft);
      setNotes(next);
      setSelectedId(note.id);
      setMode("edit");
    },
    [notes]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!id) return;
      const ok = window.confirm("Delete this note? This cannot be undone.");
      if (!ok) return;

      const next = deleteNote(notes, id);
      setNotes(next);

      // Keep selection reasonable.
      if (next.length === 0) {
        setSelectedId(null);
        setMode("none");
      } else {
        setSelectedId(next[0].id);
        setMode("edit");
      }
    },
    [notes]
  );

  return (
    <div className="app">
      <Header onNewNote={handleNew} isMobile={isMobile} />

      <main className="shell" aria-label="Notes app main content">
        <aside className="pane pane--list" aria-label="Notes list panel">
          <div className="pane__header">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
            />
          </div>

          <NoteList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelect={handleSelect}
            emptyState={listEmptyState}
          />

          <div className="pane__footer" aria-label="Notes list footer">
            <div className="stats">
              <span className="stats__item">
                <strong>{notes.length}</strong> total
              </span>
              <span className="stats__dot" aria-hidden="true">
                •
              </span>
              <span className="stats__item">
                <strong>{filteredNotes.length}</strong> shown
              </span>
            </div>
          </div>
        </aside>

        <section className="pane pane--editor" aria-label="Editor panel">
          <Editor
            mode={mode}
            note={mode === "edit" ? selectedNote : null}
            onSave={handleSave}
            onDelete={handleDelete}
            onDirtyChange={setEditorDirty}
            autoSaveMs={0}
          />
        </section>
      </main>

      <footer className="footer" aria-label="Footer">
        <div className="footer__content">
          <span className="muted">Stored locally in your browser (localStorage key: </span>
          <code className="code">notes.app.v1</code>
          <span className="muted">).</span>
        </div>
      </footer>
    </div>
  );
}
