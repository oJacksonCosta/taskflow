import { Metadata } from "next";

// Components
import RecoverForm from "./recover-form";

export const metadata: Metadata = {
  title: "TaskFlow | Recuperar senha",
};

export default function Login() {
  return (
    <section className="flex h-dvh w-dvw flex-col items-center justify-center gap-4">
      <RecoverForm />
    </section>
  );
}
