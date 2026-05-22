"use client";

import { useAuth } from "@/context/auth-contex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useState } from "react";

import { IoFilter } from "react-icons/io5";

export default function Content() {
  const { user, loading, logout } = useAuth();

  const [view, setView] = useState<"cards" | "board">("cards");
  const [showFilters, setShowFilters] = useState(false);

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
                className={`flex aspect-square h-9 cursor-pointer items-center justify-center rounded-md border border-black/10 text-sm duration-200 dark:border-white/10 ${showFilters ? "bg-default" : "bg-transparent"}`}
              >
                <IoFilter size={"1.2rem"} />
              </button>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <img
                  className="border-default aspect-square w-10 cursor-pointer rounded-full border-2"
                  src={user.photoUrl}
                />
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{user.name}</SheetTitle>
                  <SheetDescription>{user.email}</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  <h3 className="text-md font-semibold">Editar perfil</h3>

                  <div>
                    <label htmlFor="name" className="text-sm">
                      Nome
                    </label>
                    <Input id="name" defaultValue={user.name} />
                  </div>

                  <div>
                    <label htmlFor="password" className="text-sm">
                      Nova senha
                    </label>
                    <Input id="password" type="password" />
                  </div>

                  <div>
                    <label htmlFor="password-confirmation" className="text-sm">
                      Confirme a nova senha
                    </label>
                    <Input id="password-confirmation" type="password" />
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="secondary" onClick={() => {}}>
                    Salvar alterações
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Sair</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja sair?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={logout}
                          variant="destructive"
                        >
                          Sair
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </header>
        </main>
      )}
    </>
  );
}
