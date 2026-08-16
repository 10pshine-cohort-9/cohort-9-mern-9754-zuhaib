import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NoteCard } from '../components/NoteCard';
import { useAuth } from '../hooks/useAuth';
import { deleteNote, fetchNotes } from '../services/notesApi';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchNotes(token);
        if (!cancelled) {
          setNotes(response.data.notes);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load notes.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteNote(pendingDelete.id, token);
      setNotes((current) => current.filter((note) => note.id !== pendingDelete.id));
      setNotice('Note deleted.');
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || 'Unable to delete note.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="auth-orb auth-orb--peach" aria-hidden="true" />
      <div className="auth-orb auth-orb--lilac" aria-hidden="true" />

      <header className="app-header glass">
        <div>
          <p className="brand">Notes</p>
          <p className="app-header__user muted">
            {user?.name} · {user?.email}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <main className="app-main">
        <div className="app-toolbar">
          <div>
            <h1>Your notes</h1>
            <p className="subtitle">Capture ideas and keep them in one place.</p>
          </div>
          <Link className="btn btn-primary" to="/notes/new">
            Create Note
          </Link>
        </div>

        {notice ? (
          <div className="form-success" role="status">
            {notice}
            <button className="notice-dismiss" type="button" onClick={() => setNotice('')}>
              Dismiss
            </button>
          </div>
        ) : null}

        {error ? <div className="form-alert">{error}</div> : null}

        {loading ? (
          <p className="muted">Loading notes…</p>
        ) : notes.length === 0 ? (
          <div className="empty-state glass">
            <h2>No notes yet</h2>
            <p className="muted">Create your first note to get started.</p>
            <Link className="btn btn-primary" to="/notes/new">
              Create Note
            </Link>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(selected) => navigate(`/notes/${selected.id}/edit`)}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </main>

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete this note?"
          message={`“${pendingDelete.title}” will be permanently removed.`}
          confirmLabel="Delete"
          confirming={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!deleting) {
              setPendingDelete(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
