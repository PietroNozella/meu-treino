"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { MOCK_TREINOS } from "@/lib/mock";
import {
  criarSessao,
  descartarSessao,
  sessaoAtiva,
} from "@/lib/store";
import type { Sessao } from "@/lib/domain";

export default function Home() {
  const router = useRouter();
  // Lazy initializer lê localStorage direto: seguro no SSR (store tem
  // try/catch e retorna null no servidor) e evita setState dentro de effect.
  const [ativa, setAtiva] = useState<Sessao | null>(() => sessaoAtiva());
  const { data } = useSession();
  const email = data?.user?.email;
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  function iniciar(treinoId: (typeof MOCK_TREINOS)[number]["id"]) {
    const s = criarSessao(treinoId);
    router.push(`/treino/${s.treinoId}?sessao=${s.id}`);
  }

  return (
    <main className="flex flex-col gap-4">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          {hoje} · mock local
        </p>
        <h1 className="text-2xl font-bold">Meu Treino</h1>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm text-zinc-400">
            Sequência: Upper A → Lower A → Upper B → Lower B
          </p>
        </div>
        {email && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <span className="truncate text-xs text-zinc-400">{email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="min-h-9 shrink-0 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-300"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {ativa && ativa.status !== "sincronizada" && (
        <section className="rounded-xl border border-emerald-800 bg-emerald-950/60 p-4">
          <p className="text-sm font-semibold text-emerald-300">
            Sessão em andamento: {ativa.treinoNome}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() =>
                router.push(`/treino/${ativa.treinoId}?sessao=${ativa.id}`)
              }
              className="min-h-11 flex-1 rounded-lg bg-emerald-500 px-4 font-semibold text-zinc-950 active:scale-[0.98]"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                descartarSessao(ativa.id);
                setAtiva(null);
              }}
              className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300"
            >
              Descartar
            </button>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        {MOCK_TREINOS.map((t) => (
          <button
            key={t.id}
            onClick={() => iniciar(t.id)}
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

      <footer className="text-xs text-zinc-600">
        Dados mockados da planilha real. Nenhum envio ao Sheets nesta etapa.
      </footer>
    </main>
  );
}
