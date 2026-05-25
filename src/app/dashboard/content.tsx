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

import { useEffect, useState } from "react";
import { sucessToast, errorToast } from "@/lib/toast";
import { auth } from "@/firebase/firebase-config";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import { IoFilter } from "react-icons/io5";
import { FaUserLarge } from "react-icons/fa6";

export default function Content() {
  const currentUser = auth.currentUser;

  const { user, loading, logout } = useAuth();

  const [view, setView] = useState<"cards" | "board">("cards");
  const [showFilters, setShowFilters] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmNewPassword = formData.get("confirmNewPassword") as string;

    if (!user.defaultLogin) {
      errorToast("Não é possível alterar o perfil");
      return;
    }

    try {
      if (oldPassword && newPassword && confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
          errorToast("As senhas não coincidem");
          return;
        }

        if (currentUser) {
          await updatePassword(currentUser, newPassword);
          sucessToast("Senha alterada com sucesso");
        }
      }
    } catch (error) {
      console.error(error);
      errorToast("Erro ao alterar senha");
    }
  };

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
                  src={user.photoUrl || <FaUserLarge />}
                />
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{user.name}</SheetTitle>
                  <SheetDescription>{user.email}</SheetDescription>
                </SheetHeader>

                <form id="profile-form" className="space-y-6 p-4">
                  <div>
                    <h3 className="text-md font-semibold">Editar perfil</h3>
                    <p
                      className={
                        user.defaultLogin
                          ? "hidden"
                          : "text-muted-foreground text-xs"
                      }
                    >
                      (Ao logar com Google ou GitHub, as informações vêm das
                      suas contas e não podem ser alteradas)
                    </p>
                  </div>

                  <div className="relative flex items-center gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
                    <p className="bg-background text-muted-foreground absolute -top-2.5 left-3 px-1 text-sm">
                      Alterar nome
                    </p>
                    <img
                      src={user.photoUrl || <FaUserLarge />}
                      className="aspect-square w-15 rounded-full"
                    />
                    <div className="flex w-full flex-col gap-1">
                      <label htmlFor="name" className="text-sm">
                        Nome
                      </label>
                      <Input
                        id="name"
                        defaultValue={user.name}
                        disabled={!user.defaultLogin}
                      />
                    </div>
                  </div>

                  <div className="relative space-y-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
                    <p className="bg-background text-muted-foreground absolute -top-2.5 left-3 px-1 text-sm">
                      Alterar senha
                    </p>
                    <div>
                      <label htmlFor="oldPassword" className="text-sm">
                        Senha atual
                      </label>
                      <Input
                        id="oldPassword"
                        type="password"
                        disabled={!user.defaultLogin}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="text-sm">
                        Nova senha
                      </label>
                      <Input
                        id="newPassword"
                        type="password"
                        disabled={!user.defaultLogin}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmNewPassword" className="text-sm">
                        Confirme a nova senha
                      </label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        disabled={!user.defaultLogin}
                      />
                    </div>
                  </div>
                </form>
                <SheetFooter>
                  <Button
                    variant="secondary"
                    disabled={!user.defaultLogin}
                    type="submit"
                    form="profile-form"
                  >
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
