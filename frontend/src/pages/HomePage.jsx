import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { NoteCard } from '../components/NoteCard';
import { useAuth } from '../hooks/useAuth';
import { deleteNote, fetchNotes } from '../services/notesApi';

/**
 * Authenticated dashboard with notes list, create, edit, and delete.
 * @returns {import('react').ReactElement}
 */
export default function HomePage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Reloads the notes list from the API.
   * @returns {Promise<void>}
   */
  const loadNotes = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetchNotes(token);
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(err.message || 'Unable to load notes.');
    } finally {
      setLoading(false);
    }
  }, [token]);

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

        {error ? <div className="form-alert">{error}</div> : null}

        {loading ? <p className="muted">Loading notes…</p> : null}

        {!loading && notes.length === 0 ? (
          <div className="empty-state glass">
            <h2>No notes yet</h2>
            <p className="muted">Capture an idea, a list, or a draft. It all lives here.</p>
            <Link className="btn btn-primary" to="/notes/new">
              Create your first note
            </Link>
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
