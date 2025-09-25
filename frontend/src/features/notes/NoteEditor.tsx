import { FormEvent, useEffect, useState } from 'react';
import { Note, NotePayload } from '../../types/note';
import { parseTags, tagsToString } from '../../utils/tags';
import './notes.css';

interface NoteEditorProps {
  mode: 'create' | 'edit';
  note: Note | null;
  onSave: (payload: NotePayload) => Promise<void>;
  onCancel: () => void;
}

export const NoteEditor = ({ mode, note, onSave, onCancel }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTagsInput(tagsToString(note.tags));
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  }, [note]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const payload: NotePayload = {
        title: title.trim(),
        content: content.trim(),
        tags: parseTags(tagsInput)
      };
      await onSave(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save note';
      setError(message);
      return;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="note-editor">
      <header className="note-editor__header">
        <h2>{mode === 'edit' ? 'Edit note' : 'Create note'}</h2>
        <button type="button" onClick={onCancel} className="btn btn--ghost">
          Close
        </button>
      </header>
      <form className="note-editor__form" onSubmit={handleSubmit}>
        <label>
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
          />
        </label>
        <label>
          <span>Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What would you like to remember?"
            rows={10}
          />
        </label>
        <label>
          <span>Tags (comma separated)</span>
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="work, personal"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create note'}
        </button>
      </form>
    </section>
  );
};
