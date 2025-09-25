import { apiClient } from './apiClient';
import { Note, NoteAsnswer, NotePayload } from '../types/note';

export interface NotesQuery {
  tags?: string[];
}


export const getNotes = async (query?: NotesQuery) => {
  const params = query?.tags?.length ? { tags: query.tags.join(',') } : undefined;
  const { data } = await apiClient.get<NoteAsnswer>('/notes', { params });
  return data.notes;
};

export const createNote = async (payload: NotePayload) => {

  const { data } = await apiClient.post<Note>('/notes', payload);
  return data;
};

export const updateNote = async (id: string, payload: NotePayload) => {
  const { data } = await apiClient.put<Note>(`/notes/${id}`, payload);
  return data;
};

export const deleteNote = async (id: string) => {
  await apiClient.delete(`/notes/${id}`);
};

export const getNote = async (id: string) => {
  const { data } = await apiClient.get<Note>(`/notes/${id}`);
  return data;
};
