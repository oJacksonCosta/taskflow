"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase-config";
import { sucessToast, errorToast } from "@/lib/toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <Card className="w-full max-w-md">
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
