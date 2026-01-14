import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onNewNote, isMobile, theme, onThemeToggle }) {
  /**
   * App header with primary action and theme toggle.
   * @param {{onNewNote: () => void, isMobile: boolean, theme: 'light' | 'dark', onThemeToggle: () => void}} props
   */
  return (
    <header className="header" role="banner">
      <div className="header__left">
        <div className="brand" aria-label="Notes App">
          <div className="brand__mark" aria-hidden="true">
            N
          </div>
          <div className="brand__text">
            <div className="brand__title">Notes</div>
            <div className="brand__subtitle">Local, fast, offline</div>
          </div>
        </div>
      </div>

      <div className="header__right">
        <button
          type="button"
          className="btn btn-theme"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? (
            <>
              <span aria-hidden="true">🌙</span>
              {!isMobile && <span>Dark</span>}
            </>
          ) : (
            <>
              <span aria-hidden="true">☀️</span>
              {!isMobile && <span>Light</span>}
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewNote}
          aria-label="Create a new note"
        >
          {isMobile ? "New" : "New Note"}
        </button>
      </div>
    </header>
  );
}
