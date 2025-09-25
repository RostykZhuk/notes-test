import { Note } from '../../types/note';
import { NoteCard } from './NoteCard';
import './notes.css';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelect: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NoteList = ({ notes, selectedNoteId, onSelect, onDelete }: NoteListProps) => {
  if (!notes || !notes.length) {
    return <p className="empty-state">No notes yet. Create your first note to get started.</p>;
  }
  return (
    <section className="note-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onSelect={onSelect}
          onDelete={onDelete}
          isSelected={selectedNoteId === note.id}
        />
      ))}
    </section>
  );
};
