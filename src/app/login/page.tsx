import { Metadata } from "next";

// Components
import LoginForm from "./login-form";
import { BackgroundGlow } from "@/components/ui/background-glow";

export const metadata: Metadata = {
  title: "TaskFlow | Login",
};

export default function Login() {
  return (
    <section className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-4 overflow-hidden px-4">
      <BackgroundGlow />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </section>
  );
}

