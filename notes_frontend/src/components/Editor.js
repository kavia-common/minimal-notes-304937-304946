import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * @param {any} note
 * @returns {{title: string, content: string}}
 */
function toDraft(note) {
  return {
    title: typeof note?.title === "string" ? note.title : "",
    content: typeof note?.content === "string" ? note.content : "",
  };
}

// PUBLIC_INTERFACE
export default function Editor({
  mode,
  note,
  onSave,
  onDelete,
  onDirtyChange,
  autoSaveMs = 0,
}) {
  /**
   * Editor for add/edit note.
   * @param {{mode: "new"|"edit"|"none", note: any, onSave: (draft: {id?: string, title: string, content: string}) => void, onDelete: (id: string) => void, onDirtyChange?: (dirty: boolean) => void, autoSaveMs?: number}} props
   */
  const initial = useMemo(() => toDraft(note), [note]);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const titleRef = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const next = toDraft(note);
    setTitle(next.title);
    setContent(next.content);
    dirtyRef.current = false;
    onDirtyChange?.(false);
    setLastSavedAt(null);
  }, [note, onDirtyChange]);

  const isDisabled = mode === "none";
  const canDelete = mode === "edit" && note?.id;

  const isDirty = useMemo(() => {
    return title !== initial.title || content !== initial.content;
  }, [title, content, initial.title, initial.content]);

  useEffect(() => {
    if (dirtyRef.current !== isDirty) {
      dirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const doSave = () => {
    if (isDisabled) return;
    onSave({ id: note?.id, title, content });
    setLastSavedAt(new Date().toISOString());
    dirtyRef.current = false;
    onDirtyChange?.(false);
  };

  const doDelete = () => {
    if (!canDelete) return;
    onDelete(note.id);
  };

  // Keyboard shortcut: Ctrl/Cmd+S to save (within editor)
  useEffect(() => {
    const onKeyDown = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        doSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, note?.id, isDisabled]);

  // Optional autosave every N ms if enabled and dirty
  useEffect(() => {
    if (!autoSaveMs || autoSaveMs < 1000) return;
    if (isDisabled) return;

    const t = window.setInterval(() => {
      if (dirtyRef.current) doSave();
    }, autoSaveMs);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveMs, isDisabled, title, content, note?.id]);

  return (
    <section className="editor" aria-label="Editor">
      <div className="editor__header">
        <div className="editor__meta">
          <div className="editor__heading">
            {mode === "new" ? "New Note" : mode === "edit" ? "Edit Note" : "Select a note"}
          </div>
          {mode !== "none" ? (
            <div className="editor__sub">
              {note?.updatedAt ? (
                <>Last updated: {new Date(note.updatedAt).toLocaleString()}</>
              ) : note?.createdAt ? (
                <>Created: {new Date(note.createdAt).toLocaleString()}</>
              ) : (
                "Not saved yet"
              )}
              {lastSavedAt ? (
                <span className="pill" aria-label="Recently saved">
                  Saved
                </span>
              ) : null}
            </div>
          ) : (
            <div className="editor__sub muted">Pick a note from the list or create a new one.</div>
          )}
        </div>

        <div className="editor__actions">
          <button
            type="button"
            className="btn btn-success"
            onClick={doSave}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label="Save note"
            title="Save (Ctrl/Cmd+S)"
          >
            Save
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={doDelete}
            disabled={!canDelete}
            aria-disabled={!canDelete}
            aria-label="Delete note"
            title="Delete note"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="editor__body" aria-label="Note editor fields">
        <div className="field">
          <label className="label" htmlFor="note-title">
            Title
          </label>
          <input
            ref={titleRef}
            id="note-title"
            className="input"
            type="text"
            value={title}
            placeholder="Untitled"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              // autosave-on-blur nicety
              if (dirtyRef.current) doSave();
            }}
            disabled={isDisabled}
          />
        </div>

        <div className="field field--grow">
          <label className="label" htmlFor="note-content">
            Content
          </label>
          <textarea
            id="note-content"
            className="textarea"
            value={content}
            placeholder="Write your note…"
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              if (dirtyRef.current) doSave();
            }}
            disabled={isDisabled}
            aria-label="Note content"
          />
        </div>

        {mode !== "none" ? (
          <div className="editor__hint" aria-label="Keyboard shortcuts">
            Tip: Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>S</kbd> to save.
          </div>
        ) : null}
      </div>
    </section>
  );
}
