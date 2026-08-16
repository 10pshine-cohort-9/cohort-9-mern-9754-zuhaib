function formatNoteDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function previewContent(content, maxLength = 140) {
  const text = (content || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return 'No content yet.';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}…`;
}

export function NoteCard({ note, onEdit, onDelete }) {
  const updatedLabel = formatNoteDate(note.updatedAt);
  const createdLabel = formatNoteDate(note.createdAt);
  const wasUpdated = note.updatedAt && note.createdAt && note.updatedAt !== note.createdAt;

  return (
    <article className="note-card glass">
      <h2 className="note-card__title">{note.title}</h2>
      <p className="note-card__preview">{previewContent(note.content)}</p>
      <p className="note-card__meta muted">
        {wasUpdated ? `Updated ${updatedLabel}` : `Created ${createdLabel}`}
      </p>
      <div className="note-card__actions">
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => onEdit(note)}>
          Edit
        </button>
        <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => onDelete(note)}>
          Delete
        </button>
      </div>
    </article>
  );
}
