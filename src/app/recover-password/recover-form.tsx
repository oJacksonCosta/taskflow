"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Libraries
import { sendPasswordResetEmail } from "firebase/auth";

// Firebase / Services
import { auth } from "@/firebase/firebase-config";

// Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Utils
import { errorToast, sucessToast } from "@/lib/toast";

export default function RecoverForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    let email = formData.get("email") as string;

    try {
      setLoading(true);

      if (!email) {
        errorToast("Preencha o campo de email");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      sucessToast("Email de recuperação enviado!");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: any) {
      console.log(error);

      switch (error.code) {
        case "auth/user-not-found":
          errorToast("Usuário não encontrado");
          break;

        case "auth/invalid-email":
          errorToast("Email inválido");
          break;

        default:
          errorToast("Erro ao enviar email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-md bg-white/75 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/50 shadow-2xl transition-all duration-300 hover:border-indigo-500/20">
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Digite seu email para recuperar sua senha
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action="post" onSubmit={handleResetPassword} id="recover-form">
          <Input placeholder="Email" name="email" />
        </form>
      </CardContent>
      <CardFooter>
        <CardAction>
          <Button
            type="submit"
            form="recover-form"
            className="bg-default hover:bg-default-hover cursor-pointer text-white"
            disabled={loading}
            loading={loading}
          >
            Recuperar senha
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
