"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { criarSessaoDe, descartarSessao, sessaoAtiva } from "@/lib/store";
import { serieFeita } from "@/lib/domain";
import type { Sessao, Treino } from "@/lib/domain";
import RegistroMark from "./RegistroMark";

// Client-only: o fetch relativo de /api/treinos não existe no SSR.
const ListaTreinos = dynamic(() => import("@/components/ListaTreinos"), {
  ssr: false,
  loading: () => (
    <p role="status" className="py-6 text-center text-sm text-neutral-400">
      Carregando treinos…
    </p>
  ),
});

export default function Home() {
  const router = useRouter();
  // Esta tela só monta no cliente para ler a sessão ativa sem conflito de hidratação.
  const [ativa, setAtiva] = useState<Sessao | null>(() => sessaoAtiva());
  // Instantâneo de abertura para o "há Xmin" (estático, sem timer).
  const [agora] = useState(() => Date.now());
  const { data } = useSession();
  const email = data?.user?.email;
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  function iniciar(treino: Treino) {
    const s = criarSessaoDe(treino);
    router.push(`/treino/${s.treinoId}?sessao=${s.id}`);
  }

  const ativaSeries = ativa ? ativa.exercicios.flatMap((e) => e.series) : [];
  const ativaFeitas = ativaSeries.filter(serieFeita).length;
  const decorrido = ativa
    ? Math.max(
        0,
        Math.floor((agora - new Date(ativa.iniciadoEm).getTime()) / 60000),
      )
    : 0;
  const decorridoTxt =
    decorrido < 1
      ? "agora mesmo"
      : decorrido < 60
        ? `há ${decorrido}min`
        : `há ${Math.floor(decorrido / 60)}h${decorrido % 60 ? ` ${decorrido % 60}min` : ""}`;

  return (
    <main className="flex flex-col gap-7 pb-4">
      <header>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <RegistroMark />
            <span className="eyebrow text-neutral-200">Meu Treino</span>
          </div>
          {email && (
            <details className="relative">
              <summary className="button-quiet list-none px-3 text-xs">
                Conta
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-64 max-w-[calc(100vw-40px)] rounded-2xl border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
                <p className="break-all text-xs leading-relaxed text-neutral-300">
                  {email}
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="button-secondary mt-3 w-full text-xs"
                >
                  Sair da conta
                </button>
              </div>
            </details>
          )}
        </div>
        <p className="eyebrow mt-8">{hoje}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Seus treinos.
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Escolha o treino e registre suas séries.
        </p>
      </header>

      {ativa && ativa.status !== "sincronizada" && (
        <section
          aria-label="Sessão em andamento"
          className="surface-card active-session-card rounded-3xl p-5"
        >
          <p className="eyebrow accent-text">
            {ativa.status === "falha" ? "Envio pendente" : "De onde você parou"}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">
            {ativa.treinoNome}
          </h2>
          <p className="progress-pill mt-3 inline-flex rounded-full px-3 py-1 text-xs tabular-nums">
            {ativaFeitas}/{ativaSeries.length} séries · {decorridoTxt}
          </p>
          <div className="mt-4">
            <button
              onClick={() =>
                router.push(`/treino/${ativa.treinoId}?sessao=${ativa.id}`)
              }
              className="button-primary w-full"
            >
              Continuar sessão <span aria-hidden="true">→</span>
            </button>
            <button
              onClick={() => {
                descartarSessao(ativa.id);
                setAtiva(null);
              }}
              className="button-quiet mt-3 w-full text-xs"
            >
              Descartar sessão
            </button>
          </div>
        </section>
      )}

      <ListaTreinos onIniciar={iniciar} />

      <footer className="border-t border-neutral-800 pt-5 text-xs leading-relaxed text-neutral-400">
        Sua planilha, com menos toques.
        <br />
        Registre aqui e envie quando terminar.
      </footer>
    </main>
  );
}
