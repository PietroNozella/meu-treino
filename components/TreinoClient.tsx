"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Sessao, Treino } from "@/lib/domain";
import { serieFeita, sessaoParaRegistros, volumeSessao } from "@/lib/domain";
import { treinosPromise } from "@/lib/treinos";
import {
  carregarFoco,
  carregarSessao,
  criarSessaoDe,
  limparSessaoAtiva,
  salvarFoco,
  salvarSessao,
} from "@/lib/store";

function Num({
  label,
  value,
  inputMode = "decimal",
  onChange,
}: {
  label: string;
  value: number | "";
  inputMode?: "decimal" | "numeric";
  onChange: (v: number | "") => void;
}) {
  // Preserva o separador decimal enquanto a pessoa ainda está digitando.
  const [rascunho, setRascunho] = useState<string | null>(null);

  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-neutral-400">{label}</span>
      <input
        inputMode={inputMode}
        autoComplete="off"
        value={rascunho ?? value}
        placeholder="—"
        onFocus={(e) => {
          setRascunho(String(value));
          e.target.select();
        }}
        onBlur={() => setRascunho(null)}
        onChange={(e) => {
          const t = e.target.value.replace(",", ".");
          if (t === "") {
            setRascunho("");
            return onChange("");
          }
          const n = Number(t);
          if (Number.isFinite(n)) {
            setRascunho(e.target.value);
            onChange(n);
          }
        }}
        className="min-h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-2xl font-medium tabular-nums placeholder:text-neutral-500 focus:border-white"
      />
    </label>
  );
}

// RIR em chips de um toque (0–2). Tocar no selecionado limpa.
function RirChips({
  value,
  onChange,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <div
      role="group"
      aria-label="RIR (opcional)"
      className="mt-2 flex items-center justify-between gap-3"
    >
      <span className="text-xs text-neutral-400">
        RIR <span className="text-neutral-400">· opcional</span>
      </span>
      <span className="flex gap-1.5">
        {[0, 1, 2].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? "" : n)}
            aria-pressed={value === n}
            className={`min-h-11 min-w-11 rounded-full border text-sm font-semibold ${
              value === n
                ? "border-white bg-white text-black"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            {n}
          </button>
        ))}
      </span>
    </div>
  );
}

export default function TreinoClient({
  id,
  sessaoParam,
}: {
  id: string;
  sessaoParam: string | null;
}) {
  const treinos = use(treinosPromise());
  const treino = treinos.find((t) => t.id === id);
  if (!treino) {
    return (
      <main className="pt-8 text-center text-sm text-zinc-400">
        Treino não encontrado.
      </main>
    );
  }
  return <Execucao key={treino.id} treino={treino} sessaoParam={sessaoParam} />;
}

function Execucao({
  treino,
  sessaoParam,
}: {
  treino: Treino;
  sessaoParam: string | null;
}) {
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
  const [resumo, setResumo] = useState(sessao?.status === "sincronizada");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(sessao?.status === "sincronizada");
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [obsAberta, setObsAberta] = useState(false);
  const [notasAbertas, setNotasAbertas] = useState(false);
  const [salvoLocal, setSalvoLocal] = useState<boolean | null>(null);
  const tituloExercicio = useRef<HTMLHeadingElement>(null);
  const tituloResumo = useRef<HTMLHeadingElement>(null);
  const exercicioAtivo = useRef<HTMLButtonElement>(null);
  // Exercício em foco (modo um por vez), persistido por sessão.
  const [foco, setFoco] = useState<number>(() =>
    sessao ? carregarFoco(sessao.id) : 0,
  );

  function irPara(idx: number) {
    if (!sessao) return;
    const n = Math.max(0, Math.min(idx, sessao.exercicios.length - 1));
    if (n === foco) return;
    setFoco(n);
    salvarFoco(sessao.id, n);
    setObsAberta(false);
    setNotasAbertas(false);
  }

  // Garante a URL canônica (?sessao=) sem setState — só navegação.
  useEffect(() => {
    if (sessao && sessaoParam !== sessao.id) {
      router.replace(`/treino/${sessao.treinoId}?sessao=${sessao.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.id]);

  useEffect(() => {
    if (!sessao) return;
    const salvo = salvarSessao(sessao);
    // O feedback depende do resultado da escrita no armazenamento externo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSalvoLocal(salvo);
  }, [sessao]);

  useEffect(() => {
    if (resumo) {
      tituloResumo.current?.focus({ preventScroll: true });
    } else {
      exercicioAtivo.current?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
      tituloExercicio.current?.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [foco, resumo]);

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

  function patchSerie(
    exIdx: number,
    serieIdx: number,
    patch: Partial<{ carga: number | ""; reps: number | ""; rir: number | "" }>,
  ) {
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

  function removerSerie(exIdx: number, serieIdx: number) {
    setSessao((s) => {
      if (!s) return s;
      const exercicios = s.exercicios.map((ex, i) => {
        if (i !== exIdx || ex.series.length <= 1) return ex;
        return { ...ex, series: ex.series.filter((_, j) => j !== serieIdx) };
      });
      return { ...s, exercicios };
    });
  }

  const pendencias = sessao.exercicios.flatMap((ex) =>
    ex.series.filter((s) => !serieFeita(s)).map(() => ex.nome),
  );

  // Resumo agrupado por exercício (prévia do que será enviado).
  const resumoEx = sessao.exercicios
    .map((ex) => {
      const feitas = ex.series.filter(serieFeita);
      const vol = feitas.reduce(
        (a, s) =>
          a +
          (typeof s.carga === "number" && typeof s.reps === "number"
            ? s.carga * s.reps
            : 0),
        0,
      );
      return {
        nome: ex.nome,
        obs: ex.obs,
        vol,
        det: feitas
          .map(
            (s) =>
              `${s.carga}×${s.reps}${typeof s.rir === "number" ? ` RIR${s.rir}` : ""}`,
          )
          .join(", "),
      };
    })
    .filter((e) => e.det);

  function textoResumo(): string {
    const data = (sessao?.iniciadoEm || "")
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
    const linhas = resumoEx.map(
      (e) => `- ${e.nome}: ${e.det}${e.obs ? ` (${e.obs})` : ""}`,
    );
    return `${sessao?.treinoNome} ${data}:\n${linhas.join("\n")}\nVolume total: ${sessao ? volumeSessao(sessao).toLocaleString("pt-BR") : 0} kg`;
  }

  async function copiarResumo() {
    const texto = textoResumo();
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(true);
  }

  // Exercício em foco (modo um por vez).
  const nEx = sessao.exercicios.length;
  const fi = Math.max(0, Math.min(foco, nEx - 1));
  const ex = sessao.exercicios[fi];
  const feitasEx = ex.series.filter(serieFeita).length;
  const exCompleto = feitasEx === ex.series.length;

  async function finalizar() {
    setCopiado(false);
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
        throw new Error((j as { error?: string }).error || `HTTP ${r.status}`);
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
      <main className="flex flex-col gap-6 py-3">
        <header>
          <p className="eyebrow">{sessao.treinoNome}</p>
          <h1
            ref={tituloResumo}
            tabIndex={-1}
            className="mt-2 text-3xl font-semibold tracking-tight outline-none"
          >
            {enviado ? "Tudo registrado." : "Revise seu registro."}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {enviado
              ? "Sessão enviada à sua planilha."
              : "Confira as séries antes de enviar à planilha."}
          </p>
        </header>

        <div className="flex items-end justify-between gap-4 border-y border-neutral-800 py-5">
          <div>
            <p className="text-4xl font-medium tabular-nums">
              {registros.length}{" "}
              <span className="ml-2 text-sm text-neutral-400">
                séries registradas
              </span>
            </p>
          </div>
          <p className="text-right text-xs leading-5 text-neutral-400">
            Volume total
            <br />
            <span className="text-sm text-neutral-200 tabular-nums">
              {volumeSessao(sessao).toLocaleString("pt-BR")} kg
            </span>
          </p>
        </div>

        {pendencias.length > 0 && (
          <div className="rounded-2xl border border-neutral-700 p-4 text-sm leading-relaxed">
            <p className="font-medium">
              {pendencias.length}{" "}
              {pendencias.length === 1
                ? "série incompleta"
                : "séries incompletas"}
            </p>
            <p className="mt-1 text-neutral-400">
              {enviado
                ? "Somente séries com carga e repetições preenchidas foram enviadas."
                : "Somente séries com carga e repetições preenchidas serão enviadas."}
            </p>
          </div>
        )}

        {resumoEx.length > 0 ? (
          <section
            aria-label="Séries para envio"
            className="divide-y divide-neutral-800"
          >
            {resumoEx.map((e, i) => (
              <div key={i} className="py-4 first:pt-0">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-neutral-400">
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium leading-snug">{e.nome}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400 tabular-nums">
                      {e.det}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Volume: {e.vol.toLocaleString("pt-BR")} kg
                    </p>
                    {e.obs && (
                      <p className="mt-2 break-words text-sm text-neutral-400">
                        {e.obs}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <p className="text-sm text-neutral-400">
            Nenhuma série completa ainda. Volte ao treino para preencher.
          </p>
        )}

        {!enviado ? (
          <div className="flex flex-col gap-3">
            {erroEnvio && (
              <div
                role="alert"
                className="rounded-2xl border border-neutral-500 p-4 text-sm leading-relaxed"
              >
                <p className="font-semibold">Não foi possível enviar.</p>
                <p className="mt-1 text-neutral-300">{erroEnvio}</p>
                <p className="mt-2 text-neutral-400">
                  {salvoLocal
                    ? "Registro salvo neste aparelho. Tente novamente."
                    : "Mantenha esta página aberta e tente novamente."}
                </p>
              </div>
            )}
            {salvoLocal === false && (
              <p role="alert" className="text-sm text-neutral-300">
                Não foi possível salvar neste aparelho. Mantenha a página aberta
                até enviar.
              </p>
            )}
            <p className="text-xs text-neutral-400">
              Destino: sua planilha · aba Registros do App
            </p>
            <button
              onClick={enviar}
              disabled={enviando || registros.length === 0}
              className="button-primary w-full"
            >
              {enviando
                ? "Enviando…"
                : erroEnvio
                  ? "Tentar enviar novamente"
                  : `Enviar ${registros.length} ${registros.length === 1 ? "série" : "séries"} à planilha`}
            </button>
            <button
              disabled={enviando}
              onClick={() => setResumo(false)}
              className="button-secondary w-full"
            >
              Voltar e ajustar
            </button>
          </div>
        ) : (
          <div role="status" className="flex flex-col gap-3">
            <p className="text-sm text-neutral-300">✓ Envio confirmado.</p>
            <button
              onClick={() => router.push("/")}
              className="button-primary w-full"
            >
              Voltar aos treinos
            </button>
          </div>
        )}
        <button
          onClick={copiarResumo}
          disabled={registros.length === 0}
          className="button-quiet w-full"
        >
          {copiado ? "Resumo copiado ✓" : "Copiar resumo"}
        </button>
      </main>
    );
  }

  return (
    <main className="session">
      <header className="session-header">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/")}
            className="button-quiet -ml-3 px-3"
            aria-label="Voltar aos treinos"
          >
            <span aria-hidden="true">←</span> Treinos
          </button>
          <p className="text-sm font-medium">{sessao.treinoNome}</p>
          <span className="text-xs text-neutral-400 tabular-nums">
            {feitas}/{total} séries
          </span>
        </div>
        <nav
          aria-label="Exercícios"
          className="mt-2 flex gap-1.5 overflow-x-auto py-1"
        >
          {sessao.exercicios.map((x, i) => {
            const ok = x.series.filter(serieFeita).length === x.series.length;
            const ativo = i === fi;
            return (
              <button
                key={x.id}
                ref={ativo ? exercicioAtivo : undefined}
                onClick={() => irPara(i)}
                aria-label={`${x.ordem}. ${x.nome}${ok ? ", concluído" : ""}`}
                aria-current={ativo ? "step" : undefined}
                className={`min-h-11 min-w-11 shrink-0 rounded-full border text-sm font-medium ${ativo ? "border-white bg-white text-black" : ok ? "border-neutral-500 text-white" : "border-neutral-800 text-neutral-400"}`}
              >
                {ok && !ativo ? <span aria-hidden="true">✓</span> : x.ordem}
              </button>
            );
          })}
        </nav>
      </header>

      <section key={ex.id} aria-labelledby="exercise-title" className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">
            Exercício {fi + 1} de {nEx}
          </p>
          <span className="text-xs text-neutral-400">
            {exCompleto
              ? "✓ Concluído"
              : `${feitasEx} de ${ex.series.length} séries`}
          </span>
        </div>
        <h1
          id="exercise-title"
          ref={tituloExercicio}
          tabIndex={-1}
          className="mt-2 text-[26px] leading-tight font-semibold tracking-tight outline-none"
        >
          {ex.nome}
        </h1>

        <div className="mt-3 border-l-2 border-neutral-600 pl-3">
          <p className="text-xs font-medium text-neutral-300">
            Referência da planilha
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {ex.cargaRef != null ? `${ex.cargaRef} kg` : "Carga não informada"}{" "}
            · {ex.seriesPrevistas}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-5 text-neutral-400 tabular-nums">
            <span>
              S1 · {ex.reps1 ?? "—"} reps · RIR {ex.rir1 ?? "—"}
            </span>
            <span>
              S2 · {ex.reps2 ?? "—"} reps · RIR {ex.rir2 ?? "—"}
            </span>
          </div>
          {ex.proximaAcao && (
            <p className="mt-1 text-sm text-neutral-200">{ex.proximaAcao}</p>
          )}
        </div>

        {ex.ultimaObs && (
          <div className="mt-1">
            <button
              onClick={() => setNotasAbertas((v) => !v)}
              aria-expanded={notasAbertas}
              aria-controls="previous-note"
              className="button-quiet -ml-3 px-3 text-xs"
            >
              {notasAbertas
                ? "− Ocultar nota anterior"
                : "+ Nota da última sessão"}
            </button>
            {notasAbertas && (
              <p
                id="previous-note"
                className="mb-3 border-l border-neutral-700 pl-3 text-sm leading-relaxed text-neutral-400"
              >
                {ex.ultimaObs}
              </p>
            )}
          </div>
        )}

        <div className="mt-2 flex flex-col gap-3">
          {ex.series.map((se, serieIdx) => (
            <fieldset
              key={serieIdx}
              aria-label={`Série ${serieIdx + 1}`}
              className={`min-w-0 rounded-[20px] border px-4 pb-2 ${se.feita ? "border-neutral-500 bg-[#111111]" : "border-neutral-800 bg-[#101010]"}`}
            >
              <div className="flex min-h-11 items-center justify-between gap-2">
                <p className="text-xs font-medium text-neutral-300">
                  Série {serieIdx + 1}
                  <span className="ml-2 text-neutral-400">
                    {se.feita ? "✓ Registrada" : ""}
                  </span>
                </p>
                {ex.series.length > 1 && (
                  <button
                    onClick={() => removerSerie(fi, serieIdx)}
                    aria-label={`Remover série ${serieIdx + 1}`}
                    className="-mr-2 min-h-11 min-w-11 rounded-full text-lg text-neutral-400"
                  >
                    −
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Num
                  label="Carga (kg)"
                  value={se.carga}
                  onChange={(v) => patchSerie(fi, serieIdx, { carga: v })}
                />
                <Num
                  label="Repetições"
                  inputMode="numeric"
                  value={se.reps}
                  onChange={(v) => patchSerie(fi, serieIdx, { reps: v })}
                />
              </div>
              <RirChips
                value={se.rir}
                onChange={(v) => patchSerie(fi, serieIdx, { rir: v })}
              />
            </fieldset>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2">
          {ex.series.length < 4 && (
            <button
              onClick={() => addSerie(fi)}
              className="button-quiet -ml-3 px-3 text-xs"
            >
              + Adicionar série
            </button>
          )}
          <button
            onClick={() => setObsAberta((v) => !v)}
            aria-expanded={obsAberta}
            aria-controls="exercise-note"
            className="button-quiet px-3 text-xs"
          >
            {obsAberta
              ? "− Ocultar observação"
              : ex.obs
                ? "Editar observação"
                : "+ Observação"}
          </button>
        </div>
        {obsAberta ? (
          <label
            id="exercise-note"
            className="mt-2 block text-xs text-neutral-400"
          >
            Observação do exercício (opcional)
            <textarea
              rows={3}
              value={ex.obs}
              onChange={(e) =>
                setSessao((s) =>
                  s
                    ? {
                        ...s,
                        exercicios: s.exercicios.map((x, i) =>
                          i === fi ? { ...x, obs: e.target.value } : x,
                        ),
                      }
                    : s,
                )
              }
              placeholder="Algo para lembrar na próxima sessão…"
              className="mt-2 w-full resize-y rounded-2xl border border-neutral-700 bg-neutral-900 p-3 text-base text-neutral-100"
            />
          </label>
        ) : ex.obs ? (
          <p className="mt-1 break-words text-sm leading-relaxed text-neutral-400">
            {ex.obs}
          </p>
        ) : null}
      </section>

      <div className="mt-3 flex flex-col items-center gap-1">
        <p
          role="status"
          className="text-center text-xs leading-relaxed text-neutral-400"
        >
          {salvoLocal === null
            ? "Salvando neste aparelho…"
            : salvoLocal
              ? "Salvo neste aparelho · ainda não enviado"
              : "Não foi possível salvar. Mantenha esta página aberta até enviar."}
        </p>
        {fi < nEx - 1 && (
          <button onClick={finalizar} className="button-quiet text-xs">
            Revisar e encerrar agora
          </button>
        )}
      </div>

      <footer className="session-footer">
        <div className="mx-auto flex w-full max-w-[420px] gap-3">
          <button
            onClick={() => irPara(fi - 1)}
            disabled={fi === 0}
            className="button-secondary shrink-0"
          >
            <span aria-hidden="true">←</span> Anterior
          </button>
          {fi === nEx - 1 ? (
            <button
              onClick={finalizar}
              className="button-primary min-w-0 flex-1"
            >
              Revisar e enviar
            </button>
          ) : (
            <button
              onClick={() => irPara(fi + 1)}
              aria-label="Próximo exercício"
              className="button-primary min-w-0 flex-1"
            >
              Próximo <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
