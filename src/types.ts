export interface User {
  accessToken?: string;
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
  defaultLogin: boolean;
}

export interface Note {
  id: string;
  uid: string;
  title: string;
  content: string;
  type: string;
  status?: string | null;
  priority?: string | null;
  term?: Date | null;
  tags?: string[];
  date: Date;
}
