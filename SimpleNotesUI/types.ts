
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NewNote {
  title: string;
  content: string;
}

export interface UpdateNote {
  title?: string;
  content?: string;
}
   