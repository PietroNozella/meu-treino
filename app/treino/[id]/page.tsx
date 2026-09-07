"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Sessao, Treino } from "@/lib/domain";
import {
  serieFeita,
  sessaoParaRegistros,
  volumeSessao,
} from "@/lib/domain";
import { treinosPromise } from "@/lib/treinos";
import {
  carregarSessao,
  criarSessaoDe,
  limparSessaoAtiva,
  salvarSessao,
} from "@/lib/store";

function Num({
  label,
  value,
  step,
  min,
  onChange,
}: {
  label: string;
  value: number | "";
  step: number;
  min: number;
  onChange: (v: number | "") => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`diminuir ${label}`}
          onClick={() =>
            onChange(
              value === "" ? "" : Math.max(min, +(value - step).toFixed(1)),
            )
          }
          className="min-h-11 min-w-9 rounded-lg border border-zinc-700 text-lg"
        >
          −
        </button>
        <input
          inputMode="decimal"
          value={value}
          placeholder="–"
          onChange={(e) => {
            const t = e.target.value.replace(",", ".");
            if (t === "") return onChange("");
            const n = Number(t);
            if (!Number.isNaN(n)) onChange(n);
          }}
          className="min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-center text-lg font-semibold"
        />
        <button
          type="button"
          aria-label={`aumentar ${label}`}
          onClick={() =>
            onChange(value === "" ? step : +(value + step).toFixed(1))
          }
          className="min-h-11 min-w-9 rounded-lg border border-zinc-700 text-lg"
        >
          +
        </button>
      </span>
    </label>
  );
}

export default function TreinoPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { treinos } = use(treinosPromise());
  const treino = treinos.find((t) => t.id === params.id);
  if (!treino) {
    return (
      <main className="pt-8 text-center text-sm text-zinc-400">
        Treino não encontrado.
      </main>
    );
  }
  return <Execucao key={treino.id} treino={treino} sessaoParam={search.get("sessao")} />;
}

function Execucao({ treino, sessaoParam }: { treino: Treino; sessaoParam: string | null }) {
  const router = useRouter();
  // Bootstrap síncrono no lazy initializer: seguro no SSR porque o store
  // tem try/catch (retorna null / ignora escrita no servidor) e evita
  // setState dentro de effect.
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    if (sessaoParam) {
      const s = carregarSessao(sessaoParam);
      if (s) return s;
    }
    try {
      return criarSessaoDe(treino);
    } catch {
      return null;
    }
  });
  const [resumo, setResumo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // Garante a URL canônica (?sessao=) sem setState — só navegação.
  useEffect(() => {
    if (sessao && sessaoParam !== sessao.id) {
      router.replace(`/treino/${sessao.treinoId}?sessao=${sessao.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  useEffect(() => {
    if (sessao && !resumo) salvarSessao(sessao);
  }, [sessao, resumo]);

  const feitas = useMemo(
    () =>
      sessao
        ? sessao.exercicios.flatMap((e) => e.series).filter(serieFeita).length
        : 0,
    [sessao],
  );
  const total = useMemo(
    () => (sessao ? sessao.exercicios.flatMap((e) => e.series).length : 0),
    [sessao],
  );

  if (!sessao) {
    return (
      <main className="pt-8 text-center text-sm text-zinc-400">
        Carregando treino…
      </main>
    );
  }

  function patchSerie(exIdx: number, serieIdx: number, patch: Partial<{ carga: number | ""; reps: number | ""; rir: number | "" }>) {
    setSessao((s) => {
      if (!s) return s;
      const exercicios = s.exercicios.map((ex, i) => {
        if (i !== exIdx) return ex;
        const series = ex.series.map((se, j) => {
          if (j !== serieIdx) return se;
          const next = { ...se, ...patch };
          return { ...next, feita: serieFeita(next) };
        });
        return { ...ex, series };
      });
      return { ...s, exercicios };
    });
  }

  function repetirAnterior(exIdx: number, serieIdx: number) {
    const ex = sessao?.exercicios[exIdx];
    const ant = ex?.series[serieIdx - 1];
    if (!ant) return;
    patchSerie(exIdx, serieIdx, {
      carga: ant.carga,
      reps: ant.reps,
      rir: ant.rir,
    });
  }

  function addSerie(exIdx: number) {
    setSessao((s) => {
      if (!s) return s;
      const exercicios = s.exercicios.map((ex, i) => {
        if (i !== exIdx || ex.series.length >= 4) return ex;
        const last = ex.series[ex.series.length - 1];
        return {
          ...ex,
          series: [
            ...ex.series,
            {
              serie: ex.series.length + 1,
              carga: last?.carga ?? ex.cargaRef ?? "",
              reps: "" as const,
              rir: "" as const,
              feita: false,
            },
          ],
        };
      });
      return { ...s, exercicios };
    });
  }

  const pendencias = sessao.exercicios.flatMap((ex) =>
    ex.series.filter((s) => !serieFeita(s)).map(() => ex.nome),
  );

  async function finalizar() {
    const fim = new Date().toISOString();
    setSessao((s) =>
      s ? { ...s, finalizadoEm: fim, status: "pronta_envio" } : s,
    );
    setResumo(true);
  }

  async function enviar() {
    if (!sessao) return;
    setEnviando(true);
    setErroEnvio(null);
    const payload = {
      ...sessao,
      finalizadoEm: sessao.finalizadoEm ?? new Date().toISOString(),
    };
    try {
      const r = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessao: payload }),
      });
      const j: unknown = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(
          (j as { error?: string }).error || `HTTP ${r.status}`,
        );
      }
      const final = {
        ...payload,
        status: "sincronizada" as const,
      };
      setSessao(final);
      salvarSessao(final);
      limparSessaoAtiva();
      setEnviado(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha de rede.";
      setErroEnvio(msg);
      const pendente = { ...payload, status: "falha" as const };
      setSessao(pendente);
      salvarSessao(pendente);
    } finally {
      setEnviando(false);
    }
  }

  if (resumo) {
    const registros = sessaoParaRegistros(sessao);
    return (
      <main className="flex flex-col gap-4 pt-2">
        <h1 className="text-xl font-bold">Resumo — {sessao.treinoNome}</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <p>Séries registradas: <strong>{registros.length}</strong></p>
          <p>Volume válido: <strong>{volumeSessao(sessao).toLocaleString("pt-BR")} kg</strong></p>
          <p className="mt-1 break-all text-xs text-zinc-500">Sessão: {sessao.id}</p>
          {pendencias.length > 0 && (
            <p className="mt-2 text-amber-300">
              {pendencias.length} série(s) incompleta(s) foram ignoradas no envio.
            </p>
          )}
        </div>
        {registros.map((r, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 p-3 text-sm">
            <p className="font-semibold">{r.exercicio_nome} · S{r.serie}</p>
            <p className="text-zinc-400">{r.carga}kg × {r.reps} · RIR {r.rir === null ? "–" : r.rir}{r.obs ? ` · ${r.obs}` : ""}</p>
          </div>
        ))}
        {!enviado ? (
          <>
            {erroEnvio && (
              <div className="rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
                Falha no envio: {erroEnvio}
                <br />
                Sessão preservada localmente — tente de novo.
              </div>
            )}
            <button
              onClick={enviar}
              disabled={enviando || registros.length === 0}
              className="min-h-12 rounded-xl bg-emerald-500 font-bold text-zinc-950 disabled:opacity-40"
            >
              {enviando
                ? "Enviando…"
                : erroEnvio
                  ? `Tentar de novo (${registros.length})`
                  : `Confirmar envio (${registros.length})`}
            </button>
          </>
        ) : (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/60 p-4 text-sm text-emerald-200">
            Enviado para a aba Registros do App. Pode pedir ao ChatGPT para organizar a sessão.
            <button onClick={() => router.push("/")} className="mt-3 block min-h-11 w-full rounded-lg bg-emerald-500 font-bold text-zinc-950">
              Voltar ao início
            </button>
          </div>
        )}
        {!enviado && (
          <button onClick={() => setResumo(false)} className="min-h-11 rounded-lg border border-zinc-700 text-sm">
            Voltar e ajustar
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 pt-2">
      <header className="sticky top-0 z-10 -mx-4 bg-zinc-950/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{sessao.treinoNome}</h1>
            <p className="text-xs text-zinc-500">{feitas}/{total} séries · autosave local</p>
          </div>
          <button onClick={() => router.push("/")} className="min-h-11 rounded-lg border border-zinc-700 px-3 text-sm">
            Sair
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: total ? `${(feitas / total) * 100}%` : "0%" }}
          />
        </div>
      </header>

      {sessao.exercicios.map((ex, exIdx) => {
        const feitasEx = ex.series.filter(serieFeita).length;
        return (
          <section key={ex.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold leading-snug">{ex.ordem}. {ex.nome}</h2>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${feitasEx === ex.series.length ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
                {feitasEx}/{ex.series.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Ref: <strong className="text-zinc-200">{ex.cargaRef ?? "–"}kg</strong>
              {" · "}Última: {ex.reps1 ?? "–"}/{ex.reps2 ?? "–"} · RIR {ex.rir1 ?? "–"}/{ex.rir2 ?? "–"}
            </p>
            <p className="text-xs text-zinc-500">{ex.seriesPrevistas}{ex.proximaAcao ? ` · ${ex.proximaAcao}` : ""}</p>
            {ex.ultimaObs && <p className="mt-1 text-xs text-zinc-500">↳ {ex.ultimaObs}</p>}

            <div className="mt-3 flex flex-col gap-3">
              {ex.series.map((se, serieIdx) => (
                <div key={serieIdx} className={`rounded-lg border p-3 ${se.feita ? "border-emerald-800 bg-emerald-950/30" : "border-zinc-800 bg-zinc-950"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Série {serieIdx + 1} {se.feita ? "✓" : ""}</span>
                    {serieIdx > 0 && (
                      <button onClick={() => repetirAnterior(exIdx, serieIdx)} className="text-xs text-emerald-300 underline">
                        Repetir anterior
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Num label="Carga kg" value={se.carga} step={1} min={0} onChange={(v) => patchSerie(exIdx, serieIdx, { carga: v })} />
                    <Num label="Reps" value={se.reps} step={1} min={0} onChange={(v) => patchSerie(exIdx, serieIdx, { reps: v })} />
                    <Num label="RIR" value={se.rir} step={1} min={0} onChange={(v) => patchSerie(exIdx, serieIdx, { rir: v })} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {ex.series.length < 4 && (
                <button onClick={() => addSerie(exIdx)} className="min-h-10 flex-1 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-300">
                  + Adicionar série
                </button>
              )}
            </div>
            <input
              value={ex.obs}
              onChange={(e) =>
                setSessao((s) =>
                  s ? { ...s, exercicios: s.exercicios.map((x, i) => (i === exIdx ? { ...x, obs: e.target.value } : x)) } : s,
                )
              }
              placeholder="Obs do exercício (opcional)"
              className="mt-3 min-h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm"
            />
          </section>
        );
      })}

      <button onClick={finalizar} className="min-h-12 rounded-xl bg-zinc-100 font-bold text-zinc-950">
        Finalizar · {feitas}/{total}
      </button>
      <p className="pb-4 text-center text-xs text-zinc-600">
        Snapshot da prescrição congelado no início · id {sessao.id.slice(0, 8)}
      </p>
    </main>
  );
}
