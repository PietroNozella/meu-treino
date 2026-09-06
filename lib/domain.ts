// Domínio puro — sem dependência de Next, Sheets ou localStorage.
// Espelha o esquema real da planilha (abas Treino / Histórico / Resumo).

export type TreinoId = "upper-a" | "lower-a" | "upper-b" | "lower-b";

export interface PrescricaoExercicio {
  id: string;
  nome: string;
  ordem: number;
  cargaRef?: number;
  seriesPrevistas: string; // ex.: "1 aquecimento + 2 válidas"
  reps1?: number;
  reps2?: number;
  rir1?: number;
  rir2?: number;
  proximaAcao?: string;
  ultimaObs?: string;
}

export interface Treino {
  id: TreinoId;
  nome: string;
  ordem: number;
  exercicios: PrescricaoExercicio[];
}

export interface SerieLog {
  serie: number;
  carga: number | "";
  reps: number | "";
  rir: number | "";
  feita: boolean;
}

export type SessaoStatus =
  | "em_andamento"
  | "pronta_envio"
  | "sincronizada"
  | "falha";

export interface ExercicioSessao extends PrescricaoExercicio {
  series: SerieLog[];
  obs: string;
}

export interface Sessao {
  id: string;
  treinoId: TreinoId;
  treinoNome: string;
  iniciadoEm: string; // ISO
  finalizadoEm?: string;
  prescricaoSnapshot: PrescricaoExercicio[];
  exercicios: ExercicioSessao[];
  status: SessaoStatus;
}

// Linha bruta enviada ao Sheets — 1 por série válida.
// Aba destino (futura): `Registros do App` (append-only).
export interface RegistroBruto {
  session_id: string;
  iniciado_em: string;
  finalizado_em: string;
  treino_id: string;
  treino_nome: string;
  exercicio_nome: string;
  ordem_exercicio: number;
  serie: number;
  carga: number | null;
  reps: number | null;
  rir: number | null;
  obs: string;
  carga_ref_snapshot: number | null;
  reps_ref_snapshot: string;
  rir_ref_snapshot: string;
  proxima_acao_snapshot: string;
  app_version: string;
}

export function novaSerie(numero: number, cargaRef?: number): SerieLog {
  return {
    serie: numero,
    carga: cargaRef ?? "",
    reps: "",
    rir: "",
    feita: false,
  };
}

export function serieFeita(s: SerieLog): boolean {
  return (
    typeof s.carga === "number" &&
    s.carga > 0 &&
    typeof s.reps === "number" &&
    s.reps > 0
  );
}

export function sessaoParaRegistros(s: Sessao): RegistroBruto[] {
  const out: RegistroBruto[] = [];
  for (const ex of s.exercicios) {
    ex.series.forEach((serie, idx) => {
      if (!serieFeita(serie)) return;
      out.push({
        session_id: s.id,
        iniciado_em: s.iniciadoEm,
        finalizado_em: s.finalizadoEm ?? new Date().toISOString(),
        treino_id: s.treinoId,
        treino_nome: s.treinoNome,
        exercicio_nome: ex.nome,
        ordem_exercicio: ex.ordem,
        serie: idx + 1,
        carga: typeof serie.carga === "number" ? serie.carga : null,
        reps: typeof serie.reps === "number" ? serie.reps : null,
        rir: typeof serie.rir === "number" ? serie.rir : null,
        obs: ex.obs,
        carga_ref_snapshot: ex.cargaRef ?? null,
        reps_ref_snapshot: `${ex.reps1 ?? "-"} / ${ex.reps2 ?? "-"}`,
        rir_ref_snapshot: `${ex.rir1 ?? "-"} / ${ex.rir2 ?? "-"}`,
        proxima_acao_snapshot: ex.proximaAcao ?? "",
        app_version: "0.1.0-mock",
      });
    });
  }
  return out;
}

export function volumeSessao(s: Sessao): number {
  let total = 0;
  for (const ex of s.exercicios) {
    for (const serie of ex.series) {
      if (
        typeof serie.carga === "number" &&
        typeof serie.reps === "number"
      ) {
        total += serie.carga * serie.reps;
      }
    }
  }
  return total;
}
