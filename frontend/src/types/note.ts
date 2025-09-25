export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteAsnswer {
  notes: Note[];
  pagination: {
    total: number;
  }
}

export interface NotePayload {
  title: string;
  content: string;
  tags: string[];
}
