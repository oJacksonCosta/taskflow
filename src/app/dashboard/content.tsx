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
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { useState } from "react";
import createAvatar from "@/lib/avatar";

import { IoFilter, IoSearch } from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { Input } from "@/components/ui/input";

export default function Content() {
  const { user, loading, logout } = useAuth();

  const [view, setView] = useState<"cards" | "board">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const situation = [
    { value: "to-do", label: "A Fazer" },
    { value: "in-progress", label: "Em Andamento" },
    { value: "done", label: "Concluído" },
  ];
  const [selectedSituation, setSelectedSituation] = useState({
    value: "to-do",
    label: "A Fazer",
  });

  const type = [
    { value: "note", label: "Anotações" },
    { value: "task", label: "Tarefas" },
  ];

  return (
    <>
      {!user && loading && <p>Carregando perfil...</p>}

      {user && (
        <main>
          <header className="flex items-center justify-between border-b-1 border-black/10 px-6 py-2 dark:border-white/10">
            <h1>TaskFlow</h1>

            <div className="mr-6 ml-auto flex items-center gap-4 sm:mb-0 sm:ml-0">
              <div className="hidden sm:flex">
                <button
                  onClick={() => setView("cards")}
                  className={`h-9 w-24 cursor-pointer rounded-l-md border border-black/10 text-sm dark:border-white/10 ${
                    view === "cards"
                      ? "bg-default text-white"
                      : "bg-transparent"
                  }`}
                >
                  Cartões
                </button>

                <button
                  onClick={() => setView("board")}
                  className={`h-9 w-24 cursor-pointer rounded-r-md border border-black/10 text-sm duration-200 dark:border-white/10 ${
                    view === "board"
                      ? "bg-default text-white"
                      : "bg-transparent"
                  }`}
                >
                  Quadro
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex aspect-square h-9 cursor-pointer items-center justify-center rounded-md border border-black/10 text-sm duration-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 ${showFilters ? "bg-default" : "bg-transparent"}`}
                disabled={view === "board"}
              >
                <IoFilter size={16} />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user.photoUrl ? (
                  <img
                    className="border-default aspect-square w-10 cursor-pointer rounded-full border-2 object-cover"
                    src={user.photoUrl}
                    alt={user.name}
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

          <section>
            <form
              className={`${view === "cards" && showFilters ? "flex" : "hidden"} grid grid-cols-1 gap-1 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`}
            >
              <div className="relative">
                <Input type="search" className="pl-8" />
                <IoSearch className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2" />
              </div>
              <Combobox items={situation} defaultValue={selectedSituation}>
                <ComboboxInput placeholder="Situação" showClear />
                <ComboboxContent>
                  <ComboboxList>
                    {situation.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <Input />
              <Input />
              <Input />
              <Input />
            </form>
          </section>
        </main>
      )}
    </>
  );
}
