"use client";

import { use } from "react";
import { treinosPromise } from "@/lib/treinos";
import type { Treino } from "@/lib/domain";

// Roda SOMENTE no cliente (importado com ssr:false): aqui o fetch
// relativo funciona. No SSR quebraria — por isso não fica na página.
export default function ListaTreinos({
  onIniciar,
}: {
  onIniciar: (t: Treino) => void;
}) {
  const treinos = use(treinosPromise());

  return (
    <section className="flex flex-col gap-3">
      {treinos.map((t) => (
        <button
          key={t.id}
          onClick={() => onIniciar(t)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{t.nome}</span>
            <span className="text-xs text-zinc-500">
              {t.exercicios.length} exercícios
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {t.exercicios
              .slice(0, 3)
              .map((e) => e.nome)
              .join(" · ")}
            {" …"}
          </p>
          <span className="mt-3 block min-h-11 rounded-lg bg-zinc-100 py-2.5 text-center font-semibold text-zinc-950">
            Iniciar sessão
          </span>
        </button>
      ))}
    </section>
  );
}
