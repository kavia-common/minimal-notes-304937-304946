import React, { useEffect, useMemo, useState } from "react";

/**
 * Small debounce hook.
 * @param {string} value
 * @param {number} delayMs
 * @returns {string}
 */
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

// PUBLIC_INTERFACE
export default function SearchBar({ value, onChange, onClear }) {
  /**
   * Debounced search input (UI). Parent remains source of truth.
   * @param {{value: string, onChange: (v: string) => void, onClear: () => void}} props
   */
  const [draft, setDraft] = useState(value || "");
  const debounced = useDebouncedValue(draft, 200);

  useEffect(() => {
    // If parent changes (e.g., Clear Search), update draft
    setDraft(value || "");
  }, [value]);

  useEffect(() => {
    onChange(debounced);
  }, [debounced, onChange]);

  const hasValue = useMemo(() => (draft || "").trim().length > 0, [draft]);

  return (
    <div className="search" role="search" aria-label="Search notes">
      <label className="sr-only" htmlFor="note-search">
        Search notes
      </label>
      <div className="search__field">
        <input
          id="note-search"
          className="input"
          type="search"
          value={draft}
          placeholder="Search by title or content…"
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Search notes by title or content"
        />
        {hasValue ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setDraft("");
              onClear();
            }}
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
