import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { NoteCard } from '../components/NoteCard';
import { useAuth } from '../hooks/useAuth';
import { deleteNote, fetchNotes } from '../services/notesApi';

/**
 * Authenticated dashboard with notes list, search, filters, create, edit, and delete.
 * @returns {import('react').ReactElement}
 */
export default function HomePage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Reloads the notes list from the API using current search and sort.
   * @returns {Promise<void>}
   */
  const loadNotes = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetchNotes(token, { q: debouncedSearch, sort });
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(err.message || 'Unable to load notes.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, sort]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /**
   * Confirms and deletes a note, then refreshes the list.
   * @param {{ id: number, title: string }} note
   * @returns {Promise<void>}
   */
  async function handleDelete(note) {
    const confirmed = window.confirm(`Delete “${note.title}”? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(note.id);
    setError('');
    try {
      await deleteNote(note.id, token);
      setNotes((current) => current.filter((item) => item.id !== note.id));
    } catch (err) {
      setError(err.message || 'Unable to delete note.');
    } finally {
      setDeletingId(null);
    }
  }

  const hasActiveFilters = Boolean(debouncedSearch.trim()) || sort !== 'newest';

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <div className="dashboard-heading">
          <div>
            <p className="brand">Collection</p>
            <h1>Your Thoughts, One Place.</h1>
          </div>
          <Link className="btn btn-primary" to="/notes/new">
            + New note
          </Link>
        </div>

        <div className="notes-toolbar glass">
          <label className="search-field">
            <span className="sr-only">Search notes</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes…"
              aria-label="Search notes"
            />
          </label>
          <label className="sort-field">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort notes">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </label>
        </div>

        {error ? <div className="form-alert">{error}</div> : null}

        {loading ? <p className="muted">Loading notes…</p> : null}

        {!loading && notes.length === 0 && !hasActiveFilters ? (
          <div className="empty-state glass">
            <h2>No notes yet</h2>
            <p className="muted">Capture an idea, a list, or a draft. It all lives here.</p>
            <Link className="btn btn-primary" to="/notes/new">
              Create your first note
            </Link>
          </div>
        ) : null}

        {!loading && notes.length === 0 && hasActiveFilters ? (
          <div className="empty-state glass">
            <h2>No matching notes</h2>
            <p className="muted">Try a different search term or clear your filters.</p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setSearch('');
                setSort('newest');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {!loading && notes.length > 0 ? (
          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                deleting={deletingId === note.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
