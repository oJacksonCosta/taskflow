import { Metadata } from "next";

// Components
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "TaskFlow | Registro",
};

export default function Register() {
  return (
    <section className="bg-background-light dark:bg-background-dark flex h-dvh w-dvw flex-col items-center justify-center gap-4">
      <RegisterForm />
    </section>
  );
}
