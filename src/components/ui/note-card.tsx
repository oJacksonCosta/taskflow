import { Note } from "@/types";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="border-default bg-card max-w-100 rounded-lg p-4">
      <h2>{note.title}</h2>
      <p className="text-muted-foreground text-sm">{note.content}</p>
    </div>
  );
}
