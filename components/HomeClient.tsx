"use client";

import { useEffect, useRef, useState } from "react";
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
    <p role="status" className="text-secondary py-6 text-center text-sm">
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
  const conta = useRef<HTMLDetailsElement>(null);
  const email = data?.user?.email;
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  useEffect(() => {
    function fecharConta(event: KeyboardEvent | PointerEvent) {
      const details = conta.current;
      if (!details?.open) return;
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        details.open = false;
        details.querySelector("summary")?.focus();
      } else if (
        event instanceof PointerEvent &&
        !details.contains(event.target as Node)
      ) {
        details.open = false;
      }
    }
    document.addEventListener("keydown", fecharConta);
    document.addEventListener("pointerdown", fecharConta);
    return () => {
      document.removeEventListener("keydown", fecharConta);
      document.removeEventListener("pointerdown", fecharConta);
    };
  }, []);

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
            <span className="eyebrow text-primary">Meu Treino</span>
          </div>
          {email && (
            <details ref={conta} className="relative">
              <summary className="button-quiet list-none px-3 text-xs">
                Conta
              </summary>
              <div className="surface-overlay border-default radius-md absolute right-0 z-30 mt-2 w-64 max-w-[calc(100vw-40px)] border p-4 shadow-xl">
                <p className="text-secondary break-all text-xs leading-relaxed">
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
        <h1 className="display-title mt-2">
          Bora treinar?
        </h1>
        <p className="text-secondary mt-2 text-sm">
          Escolha um treino e registre do seu jeito.
        </p>
      </header>

      {ativa && ativa.status !== "sincronizada" && (
        <section
          aria-label="Sessão em andamento"
          className="surface-card active-session-card radius-lg p-5"
        >
          <p className="eyebrow accent-text">
            {ativa.status === "falha" ? "Envio pendente" : "Continua daqui"}
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

      <footer className="border-subtle text-secondary border-t pt-5 text-xs leading-relaxed">
        Seu treino, do seu jeito.
        <br />
        Registre aqui e envie quando terminar.
      </footer>
    </main>
  );
}
