import { Link } from 'react-router-dom';
import { htmlToPreview } from '../utils/sanitizeHtml';

/**
 * Formats an ISO date for display.
 * @param {string} value
 * @returns {string}
 */
function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Card for a single note in the dashboard grid.
 * @param {{ note: Object, deleting: boolean, onDelete: (note: Object) => void }} props
 * @returns {import('react').ReactElement}
 */
export function NoteCard({ note, deleting, onDelete }) {
  const preview = htmlToPreview(note.content);

  return (
    <article className="note-card glass">
      <p className="note-card-date">{formatDate(note.updatedAt)}</p>
      <h2>{note.title}</h2>
      <p className="note-card-preview">{preview || 'Empty note'}</p>
      <div className="note-card-actions">
        <Link className="btn btn-ghost btn-compact" to={`/notes/${note.id}`}>
          Edit
        </Link>
        <button
          className="btn btn-danger btn-compact"
          type="button"
          disabled={deleting}
          onClick={() => onDelete(note)}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
