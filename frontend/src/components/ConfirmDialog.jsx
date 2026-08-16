export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirming = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog glass"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message" className="muted">
          {message}
        </p>
        <div className="dialog__actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
