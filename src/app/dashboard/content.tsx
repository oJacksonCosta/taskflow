"use client";

import * as React from "react";
import { useEffect, useState } from "react";

// Libraries
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { BiCard } from "react-icons/bi";
import { CgCalendarTwo } from "react-icons/cg";
import { HiPlus } from "react-icons/hi";
import { HiOutlineTag, HiOutlineTrash } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { TbLayoutKanban, TbLogout } from "react-icons/tb";
import { FiSave } from "react-icons/fi";
import { BsEmojiSmile } from "react-icons/bs";

// Context
import { useAuth } from "@/context/auth-contex";

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
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import NoteCard from "@/components/ui/note-card";
import NoteDialog from "@/components/ui/note-dialog";
import {
  DragDropProvider,
  DragOverlay,
  useDragOperation,
} from "@dnd-kit/react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Firebase / Services
import {
  getNotes,
  getTags,
  addTag,
  deleteTag,
  addNote,
  updateNote,
  deleteNote,
} from "@/firebase/firestore";

// Utils
import createAvatar from "@/lib/avatar";
import { errorToast, sucessToast } from "@/lib/toast";

// Types
import { Note } from "@/types";

const status = [
  { value: "to-do", label: "A Fazer" },
  { value: "in-progress", label: "Em Andamento" },
  { value: "review", label: "Em Revisão" },
  { value: "concluded", label: "Concluído" },
];

const type = [
  { value: "note", label: "Anotações" },
  { value: "task", label: "Tarefas" },
];

const priority = [
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

export default function Content() {
  const { user, loading, logout, handleUpdateName, updateNameLoading } =
    useAuth();

  const [newName, setNewName] = useState("");

  const [view, setView] = useState<"cards" | "board">("cards");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedType, setSelectedType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [searchText, setSearchText] = useState("");

  const [notes, setNotes] = useState<Note[] | null>(null);

  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [addTagLoading, setAddTagLoading] = useState(false);

  // Note dialog states
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const anchor = useComboboxAnchor();

  const filters = React.useMemo(
    () => ({
      type: selectedType?.value || "",
      status: selectedStatus?.value || "",
      priority: selectedPriority?.value || "",
      tags: selectedTags || [],
      dateRange: date || {},
      searchText: searchText || "",
    }),
    [
      selectedType,
      selectedStatus,
      selectedPriority,
      selectedTags,
      date,
      searchText,
    ],
  );

  // Caso for informado status ou prioridade, altera o tipo para tarefa
  useEffect(() => {
    if (selectedPriority || selectedStatus) {
      setSelectedType(type[1]);
    }
  }, [selectedPriority, selectedStatus]);

  useEffect(() => {
    let active = true;
    if (user?.uid) {
      const fetchNotes = async () => {
        const notes = await getNotes(user.uid, filters);
        if (active) {
          setNotes(notes);
        }
      };

      fetchNotes();
    }
    return () => {
      active = false;
    };
  }, [filters, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      const fetchTags = async () => {
        const tags = await getTags(user.uid);
        setTags(tags);
      };

      fetchTags();
    }
  }, [user?.uid]);

  const handleAddTag = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedTag = newTag.trim();
    if (user?.uid && trimmedTag) {
      setAddTagLoading(true);
      try {
        const newTagObj = await addTag(user.uid, trimmedTag);
        setTags((prev) => {
          if (
            prev.some(
              (tag) => tag.name.toLowerCase() === trimmedTag.toLowerCase(),
            )
          )
            return prev;
          return [...prev, newTagObj];
        });
        setNewTag("");
        sucessToast("Tag adicionada com sucesso!");
      } catch (error: any) {
        if (error.message === "Tag já existente") {
          errorToast("Esta tag já existe!");
        } else {
          errorToast("Erro ao adicionar tag.");
        }
        console.error("Erro ao adicionar tag:", error);
      } finally {
        setAddTagLoading(false);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      if (!user?.uid) return;
      await deleteTag(user.uid, tagId);
      setTags((prev) => prev.filter((tag) => tag.id !== tagId));

      sucessToast("Tag deletada com sucesso!");
    } catch (error: any) {
      errorToast("Erro ao deletar tag.");
      console.error("Erro ao deletar tag:", error);
    }
  };

  const handleOpenCreateDialog = () => {
    setSelectedNote(null);
    setNoteDialogOpen(true);
  };

  const handleOpenEditDialog = (note: Note) => {
    setSelectedNote(note);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async (data: {
    title: string;
    content: string;
    type: "note" | "task";
    status?: string | null;
    priority?: string | null;
    term?: Date | null;
    tags?: string[];
  }) => {
    if (!user?.uid) return;

    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      errorToast("Por favor, preencha o título.");
      return;
    }

    if (!data.type) {
      errorToast("Por favor, selecione o tipo (Tarefa ou Anotação).");
      return;
    }

    setDialogLoading(true);
    try {
      if (selectedNote) {
        // Edit mode
        const updated = await updateNote(user.uid, selectedNote.id, data);
        setNotes((prev) => {
          if (!prev) return null;
          return prev.map((n) =>
            n.id === selectedNote.id
              ? {
                  ...n,
                  title: updated.title,
                  content: updated.content,
                  type: updated.type,
                  status: updated.status,
                  priority: updated.priority,
                  term: updated.term,
                  tags: updated.tags,
                }
              : n,
          );
        });
        sucessToast(
          data.type === "task"
            ? "Tarefa atualizada com sucesso!"
            : "Anotação atualizada com sucesso!",
        );
      } else {
        // Create mode
        const newNote = await addNote(user.uid, data);
        setNotes((prev) => (prev ? [newNote, ...prev] : [newNote]));
        sucessToast(
          data.type === "task"
            ? "Tarefa criada com sucesso!"
            : "Anotação criada com sucesso!",
        );
      }
      setNoteDialogOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error("Erro ao salvar nota/tarefa:", error);
      errorToast("Erro ao salvar. Tente novamente.");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!user?.uid || !selectedNote) return;

    setDeleteLoading(true);
    try {
      await deleteNote(user.uid, selectedNote.id);
      setNotes((prev) => {
        if (!prev) return null;
        return prev.filter((n) => n.id !== selectedNote.id);
      });
      sucessToast(
        selectedNote.type === "task"
          ? "Tarefa excluída com sucesso!"
          : "Anotação excluída com sucesso!",
      );
      setNoteDialogOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error("Erro ao excluir nota/tarefa:", error);
      errorToast("Erro ao excluir. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {!user && loading && (
        <div className="flex h-dvh w-dvw items-center justify-center gap-2">
          <Spinner className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      )}

      {user && (
        <main className="flex h-dvh w-dvw flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b-1 border-black/10 px-6 py-2 dark:border-white/10">
            <h1>TaskFlow</h1>

            <div className="bg-card flex items-center justify-center rounded-lg p-1">
              <div className="relative hidden h-9 lg:flex">
                <button
                  onClick={() => setView("cards")}
                  className={`${view === "cards" ? "text-white" : "text-muted-foreground"} h9 z-2 flex w-28 cursor-pointer items-center justify-center gap-1 text-sm font-semibold`}
                >
                  <BiCard className="size-4.5" />
                  Cartões
                </button>

                <button
                  onClick={() => setView("board")}
                  className={`${view === "board" ? "text-white" : "text-muted-foreground"} h9 z-2 flex w-28 cursor-pointer items-center justify-center gap-1 text-sm font-semibold`}
                >
                  <TbLayoutKanban className="size-4.5" />
                  Quadro
                </button>

                <div
                  className={`bg-default absolute left-0 h-9 w-28 transform rounded-md transition-transform duration-300 ease-in-out ${view === "cards" ? "translate-x-0" : "translate-x-28"}`}
                ></div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user.photoUrl ? (
                  <img
                    className="border-default aspect-square w-10 cursor-pointer rounded-full border-2 object-cover"
                    src={user.photoUrl}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="border-default text flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full border-2 font-semibold text-white select-none"
                    style={{
                      backgroundColor: createAvatar(user.name || "Usuário")
                        .color,
                    }}
                  >
                    {createAvatar(user.name || "Usuário").text}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p>{user.name || "Usuário"}</p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <div className="space-y-2 p-2">
                  <Field>
                    <FieldLabel>Nome de usuário</FieldLabel>
                    <Input
                      placeholder="Novo nome"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </Field>
                  <Button
                    onClick={() => handleUpdateName(newName)}
                    disabled={updateNameLoading}
                    variant="secondary"
                    className="flex cursor-pointer items-center gap-1.5"
                    loading={updateNameLoading}
                  >
                    {!updateNameLoading && <FiSave className="size-4" />}
                    Salvar
                  </Button>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowLogoutAlert(true);
                  }}
                >
                  <TbLogout />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          {/* Modal de logout */}
          <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deseja realmente sair?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você será desconectado da sua conta e precisará fazer login
                  novamente para acessar o TaskFlow.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={logout}
                  className="cursor-pointer"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal de confirmação para excluir tag */}
          <AlertDialog
            open={!!tagToDelete}
            onOpenChange={(open) => !open && setTagToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Tag</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a tag{" "}
                  <span className="font-bold">{tagToDelete?.name}</span>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    if (tagToDelete) {
                      handleDeleteTag(tagToDelete.id);
                      setTagToDelete(null);
                    }
                  }}
                  className="cursor-pointer"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal de criação/edição de tarefa/anotação */}
          <NoteDialog
            open={noteDialogOpen}
            onOpenChange={setNoteDialogOpen}
            note={selectedNote}
            tags={tags}
            onSave={handleSaveNote}
            onDelete={selectedNote ? handleDeleteNote : undefined}
            loading={dialogLoading}
            deleteLoading={deleteLoading}
          />

          {/* Filtros */}
          {view === "cards" && (
            <section className="border-b border-black/10 bg-slate-50/30 p-4 dark:border-white/10 dark:bg-zinc-900/30">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
                {/* Pesquisa */}
                <div className="relative h-fit sm:col-span-2 lg:col-span-2">
                  <Input
                    type="search"
                    className="w-full pl-8"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Pesquisar..."
                  />
                  <IoSearch className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2" />
                </div>

                {/* Tipo */}
                <Combobox
                  items={type}
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <ComboboxInput
                    placeholder="Tipo"
                    showClear
                    className="w-full"
                    disabled={!!selectedPriority || !!selectedStatus}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {type.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {/* Situação */}
                <Combobox
                  items={status}
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <ComboboxInput
                    placeholder="Situação"
                    showClear
                    className="w-full"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {status.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {/* Prioridade */}
                <Combobox
                  items={priority}
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <ComboboxInput
                    placeholder="Prioridade"
                    showClear
                    className="w-full"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {priority.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {/* Data */}
                <Field className="w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker-range"
                        className="w-full justify-start overflow-hidden px-2.5 font-normal text-ellipsis whitespace-nowrap"
                      >
                        <CgCalendarTwo className="text-muted-foreground size-4.5" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span className="text-muted-foreground">Período</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                {/* Tags */}
                <div className="col-span-full">
                  <Combobox
                    multiple
                    autoHighlight
                    items={tags.map((tag) => tag.name)}
                    value={selectedTags}
                    onValueChange={setSelectedTags}
                  >
                    <ComboboxChips
                      ref={anchor}
                      className="w-full overflow-hidden"
                    >
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
                </div>
              </div>
            </section>
          )}
          <section className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            {/* Barra de ações */}
            <div className="bg-muted fixed right-1/2 bottom-10 flex translate-x-1/2 items-center gap-2 rounded-xl p-2 shadow-xl">
              {/* Tags */}
              <Dialog modal={false}>
                <DialogTrigger asChild>
                  <Button className="bg-default hover:bg-default-hover h-12 w-12 cursor-pointer rounded-lg text-white shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1">
                    <HiOutlineTag className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tags</DialogTitle>
                    <DialogDescription>
                      Adicione ou remova tags
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <form onSubmit={handleAddTag} className="flex gap-1">
                      <Input
                        placeholder="Nova tag"
                        onChange={(e) => setNewTag(e.target.value)}
                        value={newTag}
                      />
                      <Button
                        type="submit"
                        className="bg-default hover:bg-default-hover cursor-pointer text-white duration-200"
                        disabled={!newTag.trim() || addTagLoading}
                      >
                        {addTagLoading ? (
                          <Spinner className="h-4 w-4 text-white" />
                        ) : (
                          <FiSave className="size-4" />
                        )}
                      </Button>
                    </form>

                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm font-bold">
                        Suas tags{" "}
                        <span className="text-xs font-normal">
                          (Clique sobre a tag para removê-la)
                        </span>
                      </p>
                      <Separator className="mb-2" />
                    </div>

                    {tags && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                          <div
                            key={tag.id || index}
                            onClick={() => setTagToDelete(tag)}
                            className="bg-muted text-muted-foreground flex w-fit cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all duration-200 hover:bg-red-500 hover:text-white"
                          >
                            <HiOutlineTag className="size-3.5" />
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Nova nota ou tarefa */}
              <Button
                onClick={handleOpenCreateDialog}
                className="bg-default hover:bg-default-hover h-12 w-12 cursor-pointer rounded-lg text-white shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1"
              >
                <HiPlus className="size-5" />
              </Button>
            </div>

            {notes ? (
              <ViewContent
                view={view}
                notes={notes}
                setNotes={setNotes}
                onCardClick={handleOpenEditDialog}
              />
            ) : (
              <div className="flex items-center justify-center gap-2 p-4">
                <Spinner className="text-muted-foreground h-5 w-5" />
                <p className="text-muted-foreground">Carregando notas...</p>
              </div>
            )}
          </section>
        </main>
      )}
    </>
  );
}

// Renderização do conteúdo de acordo com a view
function ViewContent({
  view,
  notes,
  setNotes,
  onCardClick,
}: {
  view: string;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[] | null>>;
  onCardClick: (note: Note) => void;
}) {
  return (
    <section
      className={`flex min-h-0 flex-1 flex-col pt-4 pr-2 pl-4 ${
        view === "cards" ? "overflow-y-auto pb-28" : "overflow-hidden pb-4"
      }`}
    >
      {view === "cards" && (
        <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => onCardClick(note)}
            />
          ))}
        </section>
      )}

      {view === "board" && (
        <BoardView
          notes={notes}
          setNotes={setNotes}
          onCardClick={onCardClick}
        />
      )}
    </section>
  );
}

function BoardView({
  notes,
  setNotes,
  onCardClick,
}: {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[] | null>>;
  onCardClick: (note: Note) => void;
}) {
  const { user } = useAuth();

  const handleDragEnd = async (event: any) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target) return;

    const noteId = source.id;
    const newStatus = target.id;

    const noteToUpdate = notes.find((n) => n.id === noteId);
    if (!noteToUpdate || noteToUpdate.status === newStatus) return;

    setNotes((prev) => {
      if (!prev) return null;
      return prev.map((n) =>
        n.id === noteId ? { ...n, status: newStatus } : n,
      );
    });

    try {
      if (!user?.uid) return;
      await updateNote(user.uid, noteId, {
        title: noteToUpdate.title,
        content: noteToUpdate.content,
        type: noteToUpdate.type as "note" | "task",
        status: newStatus,
        priority: noteToUpdate.priority,
        term: noteToUpdate.term,
        tags: noteToUpdate.tags,
      });
      sucessToast("Situação da tarefa atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar situação da tarefa:", error);
      errorToast("Erro ao atualizar situação da tarefa.");

      setNotes((prev) => {
        if (!prev) return null;
        return prev.map((n) =>
          n.id === noteId ? { ...n, status: noteToUpdate.status } : n,
        );
      });
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <BoardColumns notes={notes} onCardClick={onCardClick} />
    </DragDropProvider>
  );
}

const COLUMNS = [
  { id: "to-do", title: "A Fazer", color: "bg-default" },
  { id: "in-progress", title: "Em Andamento", color: "bg-yellow-500" },
  { id: "review", title: "Em Revisão", color: "bg-orange-500" },
  { id: "concluded", title: "Concluído", color: "bg-emerald-500" },
];

function BoardColumns({
  notes,
  onCardClick,
}: {
  notes: Note[];
  onCardClick: (note: Note) => void;
}) {
  const { source } = useDragOperation();
  const activeNote = source ? notes.find((n) => n.id === source.id) : null;

  const tasks = notes.filter((n) => n.type === "task");

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 gap-4 select-none">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);

          return (
            <div
              key={column.id}
              className="flex min-h-0 w-0 min-w-0 flex-1 flex-col rounded-2xl border border-black/5 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-zinc-900/50"
            >
              <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${column.color}`}
                  />
                  <h3 className="text-foreground text-sm font-bold">
                    {column.title}
                  </h3>
                </div>
                <span className="text-muted-foreground rounded-md bg-black/5 px-2 py-0.5 text-xs font-semibold dark:bg-white/10">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable
                id={column.id}
                className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1"
              >
                {columnTasks.length === 0 ? (
                  <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/5 bg-black/5 p-4 text-center text-xs dark:border-white/5 dark:bg-white/5">
                    Nenhuma tarefa
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <Draggable key={task.id} id={task.id}>
                      <NoteCard note={task} onClick={() => onCardClick(task)} />
                    </Draggable>
                  ))
                )}
              </Droppable>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeNote ? (
          <NoteCard note={activeNote} onClick={() => onCardClick(activeNote)} />
        ) : null}
      </DragOverlay>
    </>
  );
}
