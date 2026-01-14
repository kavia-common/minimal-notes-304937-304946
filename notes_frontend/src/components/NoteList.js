import React from "react";
import NoteItem from "./NoteItem";

// PUBLIC_INTERFACE
export default function NoteList({ notes, selectedId, onSelect, emptyState }) {
  /**
   * Note list with aria semantics.
   * @param {{notes: any[], selectedId: string|null, onSelect: (id: string) => void, emptyState: {title: string, description?: string}}} props
   */
  return (
    <section className="list" aria-label="Notes list">
      <div className="list__items" role="listbox" aria-label="Notes">
        {notes.length === 0 ? (
          <div className="empty" role="note" aria-label="Empty list">
            <div className="empty__title">{emptyState.title}</div>
            {emptyState.description ? (
              <div className="empty__desc">{emptyState.description}</div>
            ) : null}
          </div>
        ) : (
          notes.map((n) => (
            <NoteItem
              key={n.id}
              note={n}
              isSelected={n.id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </section>
  );
}
