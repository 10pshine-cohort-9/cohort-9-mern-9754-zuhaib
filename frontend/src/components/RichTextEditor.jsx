import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { sanitizeHtml } from '../utils/sanitizeHtml';

/**
 * TipTap rich text editor for note HTML content.
 * Remount with a `key` when loading a different note.
 * @param {{ value: string, onChange: (html: string) => void, disabled?: boolean }} props
 * @returns {import('react').ReactElement}
 */
export function RichTextEditor({ value, onChange, disabled = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: sanitizeHtml(value || '<p></p>'),
    immediatelyRender: false,
    editable: !disabled,
    onUpdate({ editor: current }) {
      onChange(current.getHTML());
    },
  });

  /**
   * Prompts for a URL and applies a link mark.
   */
  function addLink() {
    if (!editor) {
      return;
    }
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL', previous);
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) {
    return <div className="editor-shell muted">Loading editor…</div>;
  }

  editor.setEditable(!disabled);

  return (
    <div className={`editor-shell ${disabled ? 'is-disabled' : ''}`}>
      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
        <button
          type="button"
          className={editor.isActive('bold') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <button type="button" className={editor.isActive('link') ? 'is-active' : ''} onClick={addLink}>
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
