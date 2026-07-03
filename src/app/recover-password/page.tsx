import { Metadata } from "next";

// Components
import RecoverForm from "./recover-form";
import { BackgroundGlow } from "@/components/ui/background-glow";

export const metadata: Metadata = {
  title: "TaskFlow | Recuperar senha",
};

export default function RecoverPassword() {
  return (
    <section className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-4 overflow-hidden px-4">
      <BackgroundGlow />
      <div className="relative z-10 w-full max-w-md">
        <RecoverForm />
      </div>
    </section>
  );
}

