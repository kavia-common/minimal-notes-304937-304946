# Notes (localStorage) – React Frontend

A minimal, clean notes app built with React. All data is stored **locally in your browser** using `localStorage` (no backend, works offline).

## Features

- Create, edit, delete notes
- Notes are persisted across reloads via `localStorage`
- Search by title/content (debounced)
- Sorted by `updatedAt` (descending)
- Responsive layout (list + editor; stacks on small screens)
- Basic keyboard support (Ctrl/Cmd+S saves)

## Data Model

Each note is stored with:

- `id` (string)
- `title` (string)
- `content` (string)
- `createdAt` (ISO timestamp)
- `updatedAt` (ISO timestamp)

## Storage

Notes are stored under a single localStorage key:

- `notes.app.v1`

If you want to reset the app, clear this key in your browser devtools:
**Application → Local Storage → delete `notes.app.v1`**.

## Running

From this folder:

```bash
npm start
```

Then open the preview URL (or http://localhost:3000).

## Project Structure

- `src/App.js` – main state + layout
- `src/components/*` – UI components (Header, SearchBar, NoteList, NoteItem, Editor)
- `src/lib/storage.js` – localStorage helper with JSON guards
- `src/styles/theme.css` – theme + component styles (CSS variables)
