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
        <span className="text-secondary text-xs tabular-nums">
          {treinos.length} treinos
        </span>
      </div>
      {treinos.length === 0 ? (
        <div className="surface-card radius-lg px-5 py-8 text-center">
          <p className="font-medium">Nenhum treino disponível.</p>
          <p className="text-secondary mt-2 text-sm leading-relaxed">
            Adicione um treino à planilha e recarregue esta página.
          </p>
        </div>
      ) : (
      <div className="flex flex-col gap-3">
        {treinos.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onIniciar(t)}
            aria-label={`Iniciar ${t.nome}`}
            className="workout-card radius-lg group flex w-full items-center gap-4 border px-4 py-5 text-left"
          >
            <span
              aria-hidden="true"
              className="workout-order text-2xl font-light tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-medium tracking-tight">
                {t.nome}
              </span>
              <span className="text-secondary mt-0.5 block text-xs tabular-nums">
                {t.exercicios.length} exercícios
              </span>
              <span className="text-secondary mt-2 block truncate text-xs">
                {t.exercicios
                  .slice(0, 3)
                  .map((e) => e.nome)
                  .join(" · ")}
              </span>
            </span>
          </button>
        ))}
      </div>
      )}
    </section>
  );
}
