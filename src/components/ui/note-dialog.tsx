"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

// Icons
import { CgCalendarTwo } from "react-icons/cg";
import { HiOutlineTrash } from "react-icons/hi";
import { BsEmojiSmile } from "react-icons/bs";
import { FiSave } from "react-icons/fi";

// Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

// Types
import { Note } from "@/types";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  tags: { id: string; name: string }[];
  onSave: (data: {
    title: string;
    content: string;
    type: "note" | "task";
    status?: string | null;
    priority?: string | null;
    term?: Date | null;
    tags?: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading: boolean;
  deleteLoading: boolean;
}

const statusOptions = [
  { value: "to-do", label: "A Fazer" },
  { value: "in-progress", label: "Em Andamento" },
  { value: "review", label: "Em Revisão" },
  { value: "concluded", label: "Concluído" },
];

const typeOptions = [
  { value: "note", label: "Anotações" },
  { value: "task", label: "Tarefas" },
];

const priorityOptions = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

const popularEmojis = [
  "😊",
  "😂",
  "🥰",
  "👍",
  "🔥",
  "🎉",
  "🚀",
  "💡",
  "📌",
  "📅",
  "✅",
  "❌",
  "⚠️",
  "🛠️",
  "📝",
  "💻",
  "🎯",
  "⏳",
  "🔒",
  "🌟",
  "👀",
  "👏",
  "🙌",
  "💪",
];

export default function NoteDialog({
  open,
  onOpenChange,
  note,
  tags,
  onSave,
  onDelete,
  loading,
  deleteLoading,
}: NoteDialogProps) {
  const [formType, setFormType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [formPriority, setFormPriority] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [formStatus, setFormStatus] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTerm, setFormTerm] = useState<Date | null>(null);
  const [formTermOpen, setFormTermOpen] = useState(false);
  const [formTime, setFormTime] = useState("10:30:00");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const anchor = useComboboxAnchor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reseta o formulário ou preenche com os dados da anotação quando o modal abre
  useEffect(() => {
    if (open) {
      if (note) {
        setFormType(typeOptions.find((t) => t.value === note.type) || null);
        setFormPriority(
          note.priority
            ? priorityOptions.find((p) => p.value === note.priority) || null
            : null,
        );
        setFormStatus(
          note.status
            ? statusOptions.find((s) => s.value === note.status) || null
            : null,
        );
        setFormTags(note.tags || []);
        setFormTitle(note.title);
        setFormContent(note.content || "");
        if (note.term) {
          setFormTerm(note.term);
          const hours = String(note.term.getHours()).padStart(2, "0");
          const minutes = String(note.term.getMinutes()).padStart(2, "0");
          const seconds = String(note.term.getSeconds()).padStart(2, "0");
          setFormTime(`${hours}:${minutes}:${seconds}`);
        } else {
          setFormTerm(null);
          setFormTime("10:30:00");
        }
      } else {
        setFormType(null);
        setFormPriority(null);
        setFormStatus(null);
        setFormTags([]);
        setFormTitle("");
        setFormContent("");
        setFormTerm(null);
        setFormTime("10:30:00");
      }
      setDeleteConfirmOpen(false);
    }
  }, [open, note]);

  // Se for informado status ou prioridade, muda o tipo para tarefa
  useEffect(() => {
    if (formPriority || formStatus) {
      setFormType(typeOptions[1]);
    }
  }, [formPriority, formStatus]);

  // Ajusta a altura da textarea de acordo com o conteúdo
  useEffect(() => {
    if (open) {
      const adjustHeight = () => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      };

      adjustHeight();

      const timer = setTimeout(adjustHeight, 50);
      return () => clearTimeout(timer);
    }
  }, [formContent, open]);

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newValue = before + emoji + after;
      setFormContent(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      }, 0);
    } else {
      setFormContent((prev) => prev + emoji);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let termDate: Date | null = null;
    if (formType?.value === "task" && formTerm) {
      termDate = new Date(formTerm);
      if (formTime) {
        const [hours, minutes, seconds] = formTime.split(":").map(Number);
        termDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
      }
    }

    onSave({
      title: formTitle,
      content: formContent,
      type: formType?.value as "note" | "task",
      status: formType?.value === "task" ? formStatus?.value || "to-do" : null,
      priority:
        formType?.value === "task" ? formPriority?.value || "medium" : null,
      term: termDate,
      tags: formTags,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent className="custom-scrollbar max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {note
                ? formType?.value === "task"
                  ? "Editar Tarefa"
                  : "Editar Anotação"
                : "Novo"}
            </DialogTitle>
            <DialogDescription>
              {note
                ? `Visualize ou edite os detalhes desta ${formType?.value === "task" ? "tarefa" : "anotação"}`
                : "Crie uma nova anotação ou tarefa"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Título */}
            <Field className="gap-1.5">
              <FieldLabel className="text-xs">Título</FieldLabel>
              <Input
                placeholder="Título"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </Field>

            {/* Conteúdo com Seletor de Emoji */}
            <Field className="gap-1.5">
              <FieldLabel className="text-xs">Conteúdo</FieldLabel>
              <div className="bg-background border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 relative flex flex-col rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]">
                <textarea
                  ref={textareaRef}
                  id="note-content-textarea"
                  placeholder="Conteúdo"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="placeholder:text-muted-foreground flex min-h-[120px] w-full resize-none border-0 bg-transparent px-3 py-2 text-base outline-none focus:ring-0 focus:outline-none md:text-sm"
                />
                <div className="flex items-center justify-between border-t border-black/10 px-3 py-1.5 dark:border-white/10">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer rounded-md p-0 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <BsEmojiSmile className="size-4.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <p className="text-muted-foreground mb-2 text-xs font-semibold">
                        Emojis
                      </p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {popularEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-lg transition-transform hover:bg-black/5 active:scale-90 dark:hover:bg-white/5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Field>

            {/* Tipo e Prioridade */}
            <FieldGroup className="flex w-full flex-row gap-2">
              {/* Tipo */}
              <Field
                data-disabled={!!formPriority || !!formStatus}
                className="gap-1.5"
              >
                <FieldLabel className="text-xs">Tipo</FieldLabel>
                <Combobox
                  items={typeOptions}
                  value={formType}
                  onValueChange={setFormType}
                >
                  <ComboboxInput
                    placeholder="Tipo"
                    className="w-full"
                    disabled={!!formPriority || !!formStatus}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {typeOptions.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>

              {/* Prioridade */}
              <Field
                data-disabled={formType?.value !== "task"}
                className="gap-1.5"
              >
                <FieldLabel className="text-xs">Prioridade</FieldLabel>
                <Combobox
                  items={priorityOptions}
                  value={formPriority}
                  onValueChange={setFormPriority}
                  disabled={formType?.value !== "task"}
                >
                  <ComboboxInput
                    placeholder="Prioridade"
                    className="w-full"
                    disabled={formType?.value !== "task"}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {priorityOptions.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
            </FieldGroup>

            {/* Situação (Somente se for Tarefa) */}
            {formType?.value === "task" && (
              <Field
                data-disabled={formType?.value !== "task"}
                className="gap-1.5"
              >
                <FieldLabel className="text-xs">Situação</FieldLabel>
                <Combobox
                  items={statusOptions}
                  value={formStatus}
                  onValueChange={setFormStatus}
                  disabled={formType?.value !== "task"}
                >
                  <ComboboxInput
                    placeholder="Situação"
                    className="w-full"
                    disabled={formType?.value !== "task"}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {statusOptions.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
            )}

            {/* Tags */}
            <Field className="col-span-full gap-1.5">
              <FieldLabel className="text-xs">Tags</FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={tags.map((tag) => tag.name)}
                value={formTags}
                onValueChange={setFormTags}
              >
                <ComboboxChips ref={anchor} className="w-full overflow-hidden">
                  <ComboboxValue>
                    {(values) => (
                      <React.Fragment>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Tags" />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>Nenhuma opção</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            {/* Prazo */}
            <FieldGroup className="flex w-full flex-row gap-2">
              <Field
                data-disabled={formType?.value !== "task"}
                className="gap-1.5"
              >
                <FieldLabel className="text-xs">
                  Prazo de finalização
                </FieldLabel>
                <Popover open={formTermOpen} onOpenChange={setFormTermOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="form-date-picker"
                      className="w-full justify-between font-normal"
                      disabled={formType?.value !== "task"}
                    >
                      {formTerm
                        ? format(formTerm, "PPP")
                        : "Prazo de finalização"}
                      <CgCalendarTwo />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={formTerm!}
                      captionLayout="dropdown"
                      onSelect={(formTerm) => {
                        setFormTerm(formTerm!);
                        setFormTermOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field
                className="w-32 gap-1.5"
                data-disabled={formType?.value !== "task"}
              >
                <FieldLabel className="text-xs">Horário</FieldLabel>
                <Input
                  type="time"
                  id="form-time-picker"
                  step="1"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  disabled={formType?.value !== "task"}
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-2 sm:justify-between">
              {note && onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto flex cursor-pointer items-center gap-1.5"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={loading}
                >
                  <HiOutlineTrash className="size-4" />
                  Excluir
                </Button>
              ) : (
                <div className="mr-auto" />
              )}
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-default hover:bg-default-hover flex cursor-pointer items-center gap-1.5 text-white duration-200"
                  loading={loading}
                  disabled={loading || !formTitle.trim() || !formType?.value}
                >
                  {!loading && <FiSave className="size-4" />}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de confirmação para excluir tarefa/anotação */}
      {note && onDelete && (
        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Excluir {note.type === "task" ? "Tarefa" : "Anotação"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta{" "}
                {note.type === "task" ? "tarefa" : "anotação"}? Esta ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="cursor-pointer"
                disabled={deleteLoading}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete().then(() => setDeleteConfirmOpen(false));
                }}
                disabled={deleteLoading}
                className="flex cursor-pointer items-center gap-1.5"
              >
                {deleteLoading ? (
                  <Spinner className="h-4 w-4 text-white" />
                ) : (
                  <HiOutlineTrash className="size-4" />
                )}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
