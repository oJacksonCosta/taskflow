"use client";

import { useRouter } from "next/navigation";

// Libraries
import { BsGithub, BsGoogle } from "react-icons/bs";

// Context
import { useAuth } from "@/context/auth-contex";

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
import { Separator } from "@/components/ui/separator";

export default function LoginForm() {
  const {
    login,
    loginLoading,
    googleLogin,
    googleLoading,
    githubLogin,
    githubLoading,
  } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    login(email, password);
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Faça login para acessar seu painel!</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              onClick={() => router.push("/register")}
              className="cursor-pointer"
            >
              Registrar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-2"
            id="login-form"
            onSubmit={handleLogin}
          >
            <Input
              placeholder="joao@example.com"
              type="email"
              name="email"
              disabled={loginLoading || googleLoading || githubLoading}
            />
            <Input
              placeholder="******"
              type="password"
              name="password"
              disabled={loginLoading || googleLoading || githubLoading}
            />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <CardAction>
            <Button
              variant="default"
              form="login-form"
              loading={loginLoading}
              disabled={loginLoading || googleLoading || githubLoading}
              className="bg-default hover:bg-default-hover cursor-pointer text-white"
            >
              Entrar
            </Button>
          </CardAction>

          <Separator className="mt-2 mb-2" />

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={loginLoading || googleLoading || githubLoading}
              onClick={googleLogin}
              className="cursor-pointer"
            >
              <BsGoogle /> Google
            </Button>

            <Button
              variant="outline"
              disabled={loginLoading || googleLoading || githubLoading}
              onClick={githubLogin}
              className="cursor-pointer"
            >
              <BsGithub /> GitHub
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-gray-400">Esqueceu a senha?</p>
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => router.push("/recover-password")}
            >
              Recuperar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
