import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { RichTextEditor } from '../components/RichTextEditor';
import { useAuth } from '../hooks/useAuth';
import { createNote, fetchNote, updateNote } from '../services/notesApi';

/**
 * Shared create/edit screen for a single note.
 * @returns {import('react').ReactElement}
 */
export default function NoteEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    let cancelled = false;

    /**
     * Loads an existing note into the form.
     * @returns {Promise<void>}
     */
    async function loadNote() {
      setLoading(true);
      setError('');
      try {
        const response = await fetchNote(id, token);
        if (!cancelled) {
          setTitle(response.data.note.title);
          setContent(response.data.note.content || '<p></p>');
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

  /**
   * Validates and saves the note, then returns to the dashboard.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await updateNote(id, { title: title.trim(), content }, token);
        setNotice('Note saved.');
      } else {
        await createNote({ title: title.trim(), content }, token);
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to save note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <p className="brand">{isEditing ? 'Edit note' : 'Add note'}</p>
        <h1>{isEditing ? 'Update your note' : 'Write something new'}</h1>

        {loading ? <p className="muted">Loading note…</p> : null}

        {!loading ? (
          <form className="editor-form glass" onSubmit={handleSubmit}>
            {error ? <div className="form-alert">{error}</div> : null}
            {notice ? <div className="form-success">{notice}</div> : null}

            <label className="field">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Note title"
                maxLength={200}
                required
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>Content</span>
              <RichTextEditor
                key={isEditing ? id : 'new'}
                value={content}
                onChange={setContent}
                disabled={saving}
              />
            </label>

            <div className="editor-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <Link className="btn btn-ghost" to="/home">
                Cancel
              </Link>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
