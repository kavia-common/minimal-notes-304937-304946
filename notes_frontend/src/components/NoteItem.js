import React, { useMemo } from "react";

function formatTime(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  return d.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function truncate(str, max) {
  const s = (str || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

// PUBLIC_INTERFACE
export default function NoteItem({ note, isSelected, onSelect }) {
  /**
   * Single note row.
   * @param {{note: any, isSelected: boolean, onSelect: (id: string) => void}} props
   */
  const title = useMemo(() => (note.title || "").trim() || "Untitled", [note.title]);
  const preview = useMemo(() => truncate(note.content || "", 90), [note.content]);
  const updated = useMemo(() => formatTime(note.updatedAt || note.createdAt), [note.updatedAt, note.createdAt]);

  return (
    <div
      className={`noteItem ${isSelected ? "noteItem--selected" : ""}`}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => onSelect(note.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(note.id);
        }
      }}
    >
      <div className="noteItem__top">
        <div className="noteItem__title" title={title}>
          {title}
        </div>
        <div className="noteItem__time" aria-label={`Last updated ${updated}`}>
          {updated}
        </div>
      </div>
      <div className="noteItem__preview">{preview || <span className="muted">No content</span>}</div>
    </div>
  );
}
