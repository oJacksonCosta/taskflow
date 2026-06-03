"use client";

// Types
import { Note } from "@/types";

// Library
import { HiFlag } from "react-icons/hi";

// Components
import { Separator } from "./separator";

interface NoteCardProps {
  note: Note;
}

function getPortuguesePriority(priority: string) {
  switch (priority) {
    case "high":
      return "Alta";
    case "medium":
      return "Média";
    case "low":
      return "Baixa";
    default:
      return "Anotação";
  }
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-lg p-4 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{note.title}</h2>
          {note.type === "note" ? (
            <div className="bg-default rounded-md px-2 py-1">
              <p className="text-xs font-bold text-white">Anotação</p>
            </div>
          ) : (
            <div className={`flex gap-1 rounded-md px-2 py-1`}>
              <p className="text-xs font-bold text-white">
                <HiFlag className="size-4.5" />
                {getPortuguesePriority(note.priority!)}
              </p>
            </div>
          )}
        </div>
        <Separator className="mt-2" />
      </div>
      <p className="text-muted-foreground text-sm">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="bg-default/20 text-default rounded-md px-2 py-1 text-xs font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {note.term && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm">
            {note.term || "Sem prazo"}
          </span>
        </div>
      )}
    </div>
  );
}
