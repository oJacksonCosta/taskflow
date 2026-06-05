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
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500",
      };
    case "medium":
      return {
        text: "Média",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500",
      };
    case "low":
      return {
        text: "Baixa",
        textColor: "text-emerald-500",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500",
      };
    default:
      return {
        text: "Tarefa",
        textColor: "text-default",
        bgColor: "bg-default/20",
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

export default function NoteCard({ note }: NoteCardProps) {
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

  const getBorderColor = () => {
    if (deadlineStatus === "overdue") return "border-red-500";
    if (deadlineStatus === "warning") return "border-orange-500";
    return "border-transparent";
  };

  const getTermColor = () => {
    if (deadlineStatus === "overdue") return "text-red-500";
    if (deadlineStatus === "warning") return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div
      className={`bg-card flex h-[280px] cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 shadow-md ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-bold">{note.title}</h2>
        {note.type === "note" ? (
          <div className="text-default bg-default/20 flex items-center gap-1 rounded-md px-2 py-1">
            <FaPenAlt className="text-default size-3" />
            <p className="text-default text-xs font-bold">Anotação</p>
          </div>
        ) : (
          <div
            className={`${getTaskPriority(note.priority!).textColor} ${getTaskPriority(note.priority!).bgColor} flex items-center gap-1 rounded-md px-2 py-1`}
          >
            <HiFlag className="size-3.5" />
            <p className="text-xs font-bold">
              {getTaskPriority(note.priority!).text}
            </p>
          </div>
        )}
      </div>

      <Separator />

      <p className="text-muted-foreground flex-1 overflow-hidden text-sm whitespace-pre-wrap">
        {note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="text-muted-foreground bg-muted mt-1 line-clamp-1 rounded-lg p-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="bg-card text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-1"
            >
              <HiOutlineTag className="text-muted-foreground size-3.5" />
              <span className="text-xs font-semibold">{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* {note.type === "task" && <Separator className="mt-2 mb-2" />} */}

      <div className="flex items-center justify-between gap-2">
        {note.status && (
          <div
            className={`${getTaskStatus(note.status).textColor} ${getTaskStatus(note.status).bgColor} flex w-fit items-center gap-1 rounded-md px-2 py-1`}
          >
            {getTaskStatus(note.status).icon}
            <p className="text-xs font-bold">
              {getTaskStatus(note.status).text}
            </p>
          </div>
        )}

        {note.term && (
          <div className={`${getTermColor()} flex items-center gap-1`}>
            <TbHourglassHigh className="size-4" />
            <p className="text-sm font-semibold">
              {`${note.term.toLocaleDateString("pt-BR")} às ${note.term.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
