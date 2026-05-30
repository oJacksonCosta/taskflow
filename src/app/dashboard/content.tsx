"use client";

import { useAuth } from "@/context/auth-contex";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import * as React from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { useState, useEffect } from "react";
import createAvatar from "@/lib/avatar";

import { IoSearch } from "react-icons/io5";
import { TbLogout, TbLayoutKanban } from "react-icons/tb";
import { HiOutlineTag } from "react-icons/hi2";
import { HiPlus } from "react-icons/hi";
import { BiCard } from "react-icons/bi";
import { CgCalendarTwo } from "react-icons/cg";
import { Spinner } from "@/components/ui/spinner";
import NoteCard from "@/components/ui/note-card";

import { getNotes } from "@/firebase/firestore";
import { Note } from "@/types";

const status = [
  { value: "todo", label: "A Fazer" },
  { value: "in-progress", label: "Em Andamento" },
  { value: "review", label: "Em Revisão" },
  { value: "done", label: "Concluído" },
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

const tags = ["Pessoal", "Trabalho", "Estudos", "Compras", "Outros"];

export default function Content() {
  const { user, loading, logout } = useAuth();

  const [view, setView] = useState<"cards" | "board">("cards");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

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
  const [date, setDate] = React.useState<DateRange | undefined>({});
  const [searchText, setSearchText] = useState("");

  const [notes, setNotes] = useState<Note[] | null>(null);

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

  return (
    <>
      {!user && loading && (
        <div className="flex h-dvh w-dvw items-center justify-center gap-3">
          <Spinner className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      )}

      {user && (
        <main className="h-dvh w-dvw">
          <header className="flex items-center justify-between border-b-1 border-black/10 px-6 py-2 dark:border-white/10">
            <h1>TaskFlow</h1>

            <div className="bg-card flex items-center justify-center rounded-lg p-1">
              <div className="relative hidden h-9 sm:flex">
                <button
                  onClick={() => setView("cards")}
                  className={`${view === "cards" ? "text-white" : "text-muted-foreground"} h9 z-2 flex w-28 cursor-pointer items-center justify-center gap-1`}
                >
                  <BiCard className="size-4.5" />
                  Cartões
                </button>

                <button
                  onClick={() => setView("board")}
                  className={`${view === "board" ? "text-white" : "text-muted-foreground"} h9 z-2 flex w-28 cursor-pointer items-center justify-center gap-1`}
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
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={logout}>
                  Sair
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
                    items={tags}
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
          <section className="relative w-full">
            {/* Barra de ações */}
            <div className="bg-card fixed right-1/2 bottom-10 flex translate-x-1/2 items-center gap-2 rounded-xl p-2 shadow-lg">
              <Button
                className="h-12 w-12 cursor-pointer rounded-lg transition-all duration-200 hover:scale-110"
                variant={"secondary"}
              >
                <HiOutlineTag className="size-5" />
              </Button>

              <Button className="bg-default hover:bg-default-hover h-12 w-12 cursor-pointer rounded-lg text-white transition-all duration-200 hover:scale-110">
                <HiPlus className="size-5" />
              </Button>
            </div>
          </section>

          {notes ? <ViewContent view={view} notes={notes} /> : <Spinner />}
        </main>
      )}
    </>
  );
}

// Renderização do conteúdo de acordo com a view
function ViewContent({ view, notes }: { view: string; notes: Note[] }) {
  return (
    <section className="p-4">
      {view === "cards" && (
        <section className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </section>
      )}

      {view === "board" && (
        <section>
          <h1>Quadro</h1>
        </section>
      )}
    </section>
  );
}
