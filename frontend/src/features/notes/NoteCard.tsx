import { Note } from '../../types/note';
import './notes.css';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NoteCard = ({ note, isSelected, onSelect, onDelete }: NoteCardProps) => {
  return (
    <article
      className={`note-card ${isSelected ? 'note-card--selected' : ''}`}
      onClick={() => onSelect(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(note);
        }
      }}
    >
      <header className="note-card__header">
        <h3>{note.title || 'Untitled note'}</h3>
        <button
          type="button"
          className="note-card__delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(note);
          }}
          aria-label={`Delete ${note.title}`}
        >
          ×
        </button>
      </header>
      <p className="note-card__preview">{note.content.slice(0, 120) || 'No content yet.'}</p>
      <footer className="note-card__footer">
        <div className="note-card__tags">
          {note.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <small className="note-card__timestamp">
          Updated {new Date(note.updated_at).toLocaleString()}
        </small>
      </footer>
    </article>
  );
};
