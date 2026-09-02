import { Metadata } from "next";

// Components
import RegisterForm from "./register-form";
import { BackgroundGlow } from "@/components/ui/background-glow";

export const metadata: Metadata = {
  title: "TaskFlow | Registro",
};

export default function Register() {
  return (
    <section className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-4 overflow-hidden px-4">
      <BackgroundGlow />
      <div className="relative z-10 w-full max-w-md">
        <RegisterForm />
      </div>
    </section>
  );
}

