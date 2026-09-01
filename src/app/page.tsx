"use client";

import { redirect, RedirectType } from "next/navigation";

// Libraries
import { FaArrowCircleRight } from "react-icons/fa";
import Image from "next/image";

// Components
import { Button } from "@/components/ui/button";
import { BackgroundGlow } from "@/components/ui/background-glow";

export default function Home() {
  return (
    <section className="relative flex h-dvh w-dvw flex-col items-center justify-center overflow-hidden px-4">
      {/* Premium Background */}
      <BackgroundGlow />

      <section className="relative z-10 flex max-w-3xl flex-col items-center justify-center gap-6 text-center">
        {/* Badge Indicator */}

        <Image src="logo.svg" alt="Logo" width={250} height={50} className="" />

        <p className="w-11/12 max-w-2xl text-center text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
          Anote suas ideias, organize suas tarefas, defina prazos e mantenha sua
          rotina em ordem, elevando sua eficiência e alcançando resultados com
          mais clareza.
        </p>

        <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Button
            variant={"default"}
            className="bg-default hover:bg-default-hover flex w-full cursor-pointer items-center justify-center gap-2 px-5 py-5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all sm:w-auto"
            onClick={() => {
              redirect("/register", RedirectType.push);
            }}
          >
            Comece a utilizar
            <FaArrowCircleRight />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => {
              redirect("/login", RedirectType.push);
            }}
            className="w-full cursor-pointer border-slate-300 bg-white/50 px-5 py-5 font-medium text-slate-800 backdrop-blur-sm transition-all hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:bg-black/30 dark:text-slate-200 dark:hover:bg-zinc-900/50"
          >
            Já tem uma conta?
          </Button>
        </div>
      </section>
    </section>
  );
}
