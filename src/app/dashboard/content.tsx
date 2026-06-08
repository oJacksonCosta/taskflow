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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Firebase / Services
import { getNotes, getTags, addTag, deleteTag } from "@/firebase/firestore";

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

  // Nova tarefa/anotação
  const [createType, setCreateType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [createPriority, setCreatePriority] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [createTags, setCreateTags] = useState<string[]>([]);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTerm, setCreateTerm] = useState<Date | null>(null);
  const [createTermOpen, setCreateTermOpen] = useState(false);

  const anchor = useComboboxAnchor();

  const filters = {
    type: selectedType?.value || "",
    status: selectedStatus?.value || "",
    priority: selectedPriority?.value || "",
    tags: selectedTags || [],
    dateRange: date || {},
    searchText: searchText || "",
  };

  // Caso for informado status ou prioridade, altera o tipo para tarefa
  useEffect(() => {
    if (selectedPriority || selectedStatus) {
      setSelectedType(type[1]);
    }
  }, [selectedPriority, selectedStatus]);

  useEffect(() => {
    if (user?.uid) {
      const fetchNotes = async () => {
        const notes = await getNotes(user.uid, filters);
        setNotes(notes);
      };

      fetchNotes();
    }
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
              <div className="relative hidden h-9 sm:flex">
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
                    className="cursor-pointer"
                    loading={updateNameLoading}
                  >
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
          <section className="relative w-full overflow-y-auto pb-25">
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
              <Dialog modal={false}>
                <DialogTrigger asChild>
                  <Button className="bg-default hover:bg-default-hover h-12 w-12 cursor-pointer rounded-lg text-white shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1">
                    <HiPlus className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova anotação</DialogTitle>
                    <DialogDescription>
                      Crie uma nova anotação ou tarefa
                    </DialogDescription>
                  </DialogHeader>

                  <form action="" className="flex flex-col gap-2">
                    {/* Tipo */}
                    <Combobox
                      items={type}
                      value={createType}
                      onValueChange={setCreateType}
                    >
                      <ComboboxInput
                        placeholder="Tipo"
                        showClear
                        className="w-full"
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

                    {/* Prioridade */}
                    <Combobox
                      items={priority}
                      value={createPriority}
                      onValueChange={setCreatePriority}
                    >
                      <ComboboxInput
                        placeholder="Prioridade"
                        showClear
                        className="w-full"
                        disabled={createType?.value !== "task"}
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

                    {/* Tags */}
                    <div className="col-span-full">
                      <Combobox
                        multiple
                        autoHighlight
                        items={tags.map((tag) => tag.name)}
                        value={createTags}
                        onValueChange={setCreateTags}
                      >
                        <ComboboxChips
                          ref={anchor}
                          className="w-full overflow-hidden"
                        >
                          <ComboboxValue>
                            {(values) => (
                              <React.Fragment>
                                {values.map((value: string) => (
                                  <ComboboxChip key={value}>
                                    {value}
                                  </ComboboxChip>
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

                    {/* Prazo */}
                    <FieldGroup className="flex w-full flex-row gap-2">
                      <Field>
                        <Popover
                          open={createTermOpen}
                          onOpenChange={setCreateTermOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date-picker-optional"
                              className="justify-between font-normal"
                              disabled={createType?.value !== "task"}
                            >
                              {createTerm
                                ? format(createTerm, "PPP")
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
                              selected={createTerm!}
                              captionLayout="dropdown"
                              onSelect={(createTerm) => {
                                setCreateTerm(createTerm!);
                                setCreateTermOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                      <Field className="w-32">
                        <Input
                          type="time"
                          id="time-picker-optional"
                          step="1"
                          defaultValue="10:30:00"
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          disabled={createType?.value !== "task"}
                        />
                      </Field>
                    </FieldGroup>

                    {/* Título */}
                    <Input
                      placeholder="Título"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                    />

                    {/* Conteúdo */}
                    <Textarea
                      placeholder="Conteúdo"
                      value={createContent}
                      onChange={(e) => setCreateContent(e.target.value)}
                    />
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {notes ? (
              <ViewContent view={view} notes={notes} />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <Spinner className="text-muted-foreground h-6 w-6" />
              </div>
            )}
          </section>
        </main>
      )}
    </>
  );
}

// Renderização do conteúdo de acordo com a view
function ViewContent({ view, notes }: { view: string; notes: Note[] }) {
  return (
    <section className="min-h-0 flex-1 overflow-hidden p-4 pr-2">
      {view === "cards" && (
        <section className="grid h-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </section>
      )}

      {view === "board" && (
        <section className="h-full overflow-y-auto">
          <h1>Quadro</h1>
        </section>
      )}
    </section>
  );
}
