import { Metadata } from "next";

// Components
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "TaskFlow | Login",
};

export default function Login() {
  return (
    <section className="flex h-dvh w-dvw flex-col items-center justify-center gap-4">
      <LoginForm />
    </section>
  );
}
