"use client";

// Types
import { Note } from "@/types";

// Library
import {
  HiFlag,
  HiOutlineClock,
  HiOutlineTag,
  HiDotsHorizontal,
} from "react-icons/hi";
import { FaPenAlt } from "react-icons/fa";
import { PiChecksBold, PiEyeBold } from "react-icons/pi";
import { TbHourglassHigh } from "react-icons/tb";

// Components
import { Separator } from "./separator";

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

function getTaskPriority(priority: string) {
  switch (priority) {
    case "high":
      return {
        text: "Alta",
        textColor: "text-red-500",
        bgColor: "bg-red-500",
        borderColor: "border-red-500",
      };
    case "medium":
      return {
        text: "Média",
        textColor: "text-orange-500",
        bgColor: "bg-orange-500",
        borderColor: "border-orange-500",
      };
    case "low":
      return {
        text: "Baixa",
        textColor: "text-emerald-500",
        bgColor: "bg-emerald-500",
        borderColor: "border-emerald-500",
      };
    default:
      return {
        text: "Tarefa",
        textColor: "text-default",
        bgColor: "bg-default",
        borderColor: "border-default",
      };
  }
}

function getTaskStatus(status: string) {
  switch (status) {
    case "to-do":
      return {
        text: "A Fazer",
        textColor: "text-default",
        bgColor: "bg-default/20",
        borderColor: "border-default",
        icon: <HiOutlineClock className="size-4" />,
      };
    case "in-progress":
      return {
        text: "Em Andamento",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500",
        icon: <HiDotsHorizontal className="size-4" />,
      };
    case "review":
      return {
        text: "Em Revisão",
        textColor: "text-orange-500",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500",
        icon: <PiEyeBold className="size-4" />,
      };
    case "concluded":
      return {
        text: "Concluído",
        textColor: "text-emerald-500",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500",
        icon: <PiChecksBold className="size-4" />,
      };
    default:
      return {
        text: "Tarefa",
        textColor: "text-default",
        bgColor: "bg-default/20",
        borderColor: "border-default",
        icon: <HiOutlineClock className="size-4" />,
      };
  }
}

function getPortugueseType(type: string) {
  switch (type) {
    case "note":
      return "Anotação";
    case "task":
      return "Tarefa";
    default:
      return "Anotação";
  }
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const getDeadlineStatus = () => {
    if (!note.term || note.status === "concluded") return "normal";

    const now = new Date();
    const diffTime = note.term.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) return "overdue";
    if (diffDays <= 2) return "warning";
    return "normal";
  };

  const deadlineStatus = getDeadlineStatus();

  const getTermColor = () => {
    if (deadlineStatus === "overdue") return "text-red-500";
    if (deadlineStatus === "warning") return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div
      onClick={onClick}
      className={`flex h-[280px] w-full min-w-[200px] cursor-pointer flex-col overflow-hidden rounded-2xl p-0.5 shadow-md ${getTaskPriority(note.priority!).bgColor}`}
    >
      {note.type === "task" && (
        <div className="flex items-center justify-center gap-1 p-0.5">
          <HiFlag className="size-4" />
          <p className="shrink-0 text-xs font-semibold">
            PRIORIDADE {getTaskPriority(note.priority!).text.toUpperCase()}
          </p>
        </div>
      )}

      {note.type === "note" && (
        <div className="flex items-center justify-center gap-1 p-0.5">
          <FaPenAlt className="size-3.5" />
          <p className="shrink-0 text-xs font-semibold">ANOTAÇÃO</p>
        </div>
      )}
      <div className="bg-card flex min-h-0 flex-1 flex-col gap-2 rounded-2xl p-4">
        <h2 className="font-bold">{note.title}</h2>

        <Separator className="shrink-0" />

        <p className="text-muted-foreground flex-1 overflow-hidden text-sm whitespace-pre-wrap">
          {note.content}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="mt-1 line-clamp-2 flex shrink-0 flex-wrap gap-1 overflow-hidden">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-1"
              >
                <HiOutlineTag className="text-muted-foreground size-3.5" />
                <span className="text-xs font-semibold">{tag}</span>
              </span>
            ))}
          </div>
        )}
        {note.type === "task" && (
          <div className="flex min-w-0 shrink-0 items-center justify-between gap-2">
            {note.status && (
              <div
                className={`${getTaskStatus(note.status).textColor} ${getTaskStatus(note.status).bgColor} flex min-w-0 items-center gap-1 rounded-md px-2 py-1`}
              >
                <span className="flex shrink-0 items-center">
                  {getTaskStatus(note.status).icon}
                </span>
                <p className="truncate text-xs font-bold">
                  {getTaskStatus(note.status).text}
                </p>
              </div>
            )}
            {note.term && (
              <div
                className={`${getTermColor()} flex shrink-0 items-center gap-1`}
              >
                <TbHourglassHigh className="size-4 shrink-0" />
                <p className="text-xs font-semibold whitespace-nowrap">
                  {`${note.term.toLocaleDateString("pt-BR")} às ${note.term.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
