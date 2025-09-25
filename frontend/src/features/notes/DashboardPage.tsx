import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotes } from '../../hooks/useNotes';
import { Note, NotePayload } from '../../types/note';
import { parseTags, tagsToString } from '../../utils/tags';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import './notes.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notes, isLoading, error, fetchNotes, create, update, remove } = useNotes();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [filterInput, setFilterInput] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchNotes(activeTags.length ? { tags: activeTags } : undefined);
  }, [fetchNotes, activeTags]);

  useEffect(() => {
    if (!selectedNote) {
      return;
    }
    const exists = notes.find((note) => note.id === selectedNote.id) ?? null;
    if (!exists) {
      setSelectedNote(null);
      setIsEditorOpen(false);
    } else if (exists !== selectedNote) {
      setSelectedNote(exists);
    }
  }, [notes, selectedNote]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openCreate = () => {
    setSelectedNote(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setSelectedNote(note);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
  };

  const onSave = async (payload: NotePayload) => {
    if (editorMode === 'edit' && selectedNote) {
      const updated = await update(selectedNote.id, payload);
      setSelectedNote(updated);
      setBannerMessage('Note updated');
    } else {
      const created = await create(payload);
      setSelectedNote(created);
      setBannerMessage('Note created');
    }
    setIsEditorOpen(false);
    await fetchNotes(activeTags.length ? { tags: activeTags } : undefined);
  };

  const handleDelete = async (note: Note) => {
    const confirmed = window.confirm(`Delete note "${note.title || 'Untitled'}"?`);
    if (!confirmed) {
      return;
    }
    await remove(note.id);
    setBannerMessage('Note deleted');
    if (selectedNote?.id === note.id) {
      setSelectedNote(null);
      setIsEditorOpen(false);
    }
    await fetchNotes(activeTags.length ? { tags: activeTags } : undefined);
  };

  useEffect(() => {
    if (bannerMessage) {
      const timeout = setTimeout(() => setBannerMessage(null), 3000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [bannerMessage]);

  const activeTagsLabel = useMemo(() => tagsToString(activeTags), [activeTags]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tags = parseTags(filterInput);
    setActiveTags(tags);
  };

  const resetFilters = () => {
    setFilterInput('');
    setActiveTags([]);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>QuickNotes</h1>
          <p>Welcome back{user ? `, ${user.email}` : ''}.</p>
        </div>
        <button className="btn btn--ghost" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="dashboard__toolbar">
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <label>
            <span>Filter by tags</span>
            <input
              value={filterInput}
              onChange={(event) => setFilterInput(event.target.value)}
              placeholder="E.g. work, personal"
            />
          </label>
          <div className="filter-actions">
            <button className="btn btn--primary" type="submit">
              Apply filter
            </button>
            <button className="btn" type="button" onClick={resetFilters}>
              Clear
            </button>
          </div>
        </form>
        <button className="btn btn--primary" type="button" onClick={openCreate}>
          + New note
        </button>
      </section>

      {activeTags.length > 0 && (
        <div className="active-tags">
          <strong>Active tags:</strong>
          <span>{activeTagsLabel}</span>
        </div>
      )}

      {bannerMessage && <div className="banner">{bannerMessage}</div>}
      {error && <div className="banner banner--error">{error}</div>}

      <main className="dashboard__content">
        <div className="dashboard__notes">
          {isLoading ? (
            <p className="loading">Loading notes...</p>
          ) : (
            <NoteList
              notes={notes}
              selectedNoteId={selectedNote?.id ?? null}
              onSelect={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {isEditorOpen && (
          <NoteEditor
            mode={editorMode}
            note={selectedNote}
            onSave={onSave}
            onCancel={closeEditor}
          />
        )}
      </main>
    </div>
  );
};
