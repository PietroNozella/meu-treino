"use client";

import { use } from "react";
import { treinosPromise } from "@/lib/treinos";
import type { Treino } from "@/lib/domain";

export default function ListaTreinos({
  onIniciar,
}: {
  onIniciar: (t: Treino) => void;
}) {
  const treinos = use(treinosPromise());

  return (
    <section aria-labelledby="workouts-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="workouts-heading" className="eyebrow">
          Na sua planilha
        </h2>
        <span className="text-xs text-neutral-400">
          {treinos.length} treinos
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {treinos.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onIniciar(t)}
            aria-label={`Iniciar ${t.nome}`}
            className="group flex w-full items-center gap-4 rounded-[22px] border border-neutral-800 bg-[#111111] px-4 py-5 text-left transition-colors hover:border-neutral-500 active:bg-neutral-800"
          >
            <span
              aria-hidden="true"
              className="text-xl font-light text-neutral-500 tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-medium tracking-tight">
                {t.nome}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-400">
                {t.exercicios.length} exercícios
              </span>
              <span className="mt-2 block truncate text-xs text-neutral-400">
                {t.exercicios
                  .slice(0, 3)
                  .map((e) => e.nome)
                  .join(" · ")}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-lg text-neutral-400 group-hover:text-white"
            >
              ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
