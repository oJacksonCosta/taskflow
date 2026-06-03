"use client";

import { redirect, RedirectType } from "next/navigation";

// Libraries
import { FaArrowCircleRight } from "react-icons/fa";

// Components
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="bg-background-light dark:bg-background-dark flex h-dvh w-dvw flex-col items-center">
      <section className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-center text-4xl">
          Bem-vindo ao{" "}
          <span className="text-default font-black">TaskFlow!</span>
        </h1>

        <p className="w-9/10 text-center text-gray-400 lg:w-7/10">
          Anote suas ideias, organize suas tarefas, defina prazos e mantenha sua
          rotina em ordem, elevando sua eficiência e alcançando resultados com
          mais clareza.
        </p>

        <div className="flex flex-col flex-wrap justify-center gap-4 md:flex-row">
          <Button
            variant={"default"}
            className="bg-default hover:bg-default-hover w-fit text-black dark:text-white"
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
            className="text-black dark:text-white"
          >
            Já tenho uma conta
          </Button>
        </div>
      </section>
    </section>
  );
}
