import { useCallback, useMemo, useState } from 'react';
import { createNote, deleteNote, getNotes, updateNote, NotesQuery } from '../services/notesService';
import { Note, NotePayload } from '../types/note';
import { extractErrorMessage } from '../utils/error';

interface UseNotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

export const useNotes = () => {
  const [state, setState] = useState<UseNotesState>({
    notes: [],
    isLoading: false,
    error: null
  });

  const fetchNotes = useCallback(async (query?: NotesQuery) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getNotes(query);
      setState({ notes: data, isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: extractErrorMessage(error) }));
    }
  }, []);

  const create = useCallback(async (payload: NotePayload) => {
    try {
      const note = await createNote(payload);
      setState((prev) => ({
        ...prev,
        notes: [note, ...prev.notes]
      }));
      return note;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  const update = useCallback(async (id: string, payload: NotePayload) => {
    try {
      const updated = await updateNote(id, payload);
      setState((prev) => ({
        ...prev,
        notes: prev.notes.map((note) => (note.id === id ? updated : note))
      }));
      return updated;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteNote(id);
      setState((prev) => ({
        ...prev,
        notes: prev.notes.filter((note) => note.id !== id)
      }));
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  return useMemo(
    () => ({
      notes: state.notes,
      isLoading: state.isLoading,
      error: state.error,
      fetchNotes,
      create,
      update,
      remove
    }),
    [state.notes, state.isLoading, state.error, fetchNotes, create, update, remove]
  );
};
