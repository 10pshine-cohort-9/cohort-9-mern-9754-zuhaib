import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createNote, fetchNote, updateNote } from '../services/notesApi';

export default function NoteEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [loaded, setLoaded] = useState(!isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    let cancelled = false;

    async function loadNote() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchNote(id, token);
        if (!cancelled) {
          setTitle(response.data.note.title);
          setContent(response.data.note.content);
          setLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load note.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNote();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await updateNote(id, { title, content }, token);
        navigate('/home', { replace: true, state: { notice: 'Note updated.' } });
      } else {
        await createNote({ title, content }, token);
        navigate('/home', { replace: true, state: { notice: 'Note created.' } });
      }
    } catch (err) {
      setError(err.message || 'Unable to save note.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="auth-orb auth-orb--peach" aria-hidden="true" />
      <div className="auth-orb auth-orb--lilac" aria-hidden="true" />

      <main className="app-main app-main--narrow">
        <p className="brand">Notes</p>
        <h1>{isEditing ? 'Edit note' : 'New note'}</h1>
        <p className="subtitle">
          {isEditing ? 'Update the title and content, then save.' : 'Add a title and write in the textarea below.'}
        </p>

        {loading ? (
          <p className="muted">Loading note…</p>
        ) : !loaded ? (
          <>
            {error ? <div className="form-alert">{error}</div> : null}
            <Link className="btn btn-ghost" to="/home">
              Back to notes
            </Link>
          </>
        ) : (
          <form className="editor-form glass" onSubmit={handleSubmit}>
            {error ? <div className="form-alert">{error}</div> : null}

            <label className="field">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                required
                maxLength={200}
              />
            </label>

            <label className="field">
              <span>Content</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note…"
                rows={12}
                maxLength={50000}
              />
            </label>

            <div className="editor-actions">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create note'}
              </button>
              <Link className="btn btn-ghost" to="/home">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
