import type { sheets_v4 } from "googleapis";
import type { Sessao } from "../domain";
import { serieFeita } from "../domain";

export const ABA_REGISTROS = "Registros do App";

// Header exato da aba (criada manualmente). Ordem importa — o append é posicional.
export const REGISTROS_HEADER = [
  "registro_id",
  "sessao_id",
  "data_treino",
  "treino",
  "exercicio_id",
  "exercicio",
  "ordem_exercicio",
  "numero_serie",
  "tipo_serie",
  "carga_kg",
  "referencia_carga",
  "repeticoes",
  "rir",
  "observacoes",
  "prescricao_snapshot",
  "iniciado_em",
  "finalizado_em",
  "enviado_em",
  "status_processamento",
  "processado_em",
  "observacoes_processamento",
] as const;

export interface LinhaValidada {
  sessaoId: string;
  linhas: (string | number | "")[][];
}

// Valida o essencial e converte a sessão em linhas posicionais.
// Uma linha por série válida. registro_id determinístico para dedup visual.
export function sessaoParaLinhas(
  s: Sessao,
  enviadoEm: string,
): LinhaValidada {
  if (!s.id || !s.treinoId || !s.treinoNome || !Array.isArray(s.exercicios)) {
    throw new Error("Sessão inválida: id/treino/exercícios ausentes.");
  }
  const dataTreino = (s.iniciadoEm || "").slice(0, 10);
  const fim = s.finalizadoEm || enviadoEm;
  const linhas: (string | number | "")[][] = [];

  for (const ex of s.exercicios) {
    ex.series.forEach((serie, idx) => {
      if (!serieFeita(serie)) return;
      const nSerie = idx + 1;
      const snapshot = JSON.stringify({
        carga_ref: ex.cargaRef ?? null,
        reps_ref: `${ex.reps1 ?? "-"} / ${ex.reps2 ?? "-"}`,
        rir_ref: `${ex.rir1 ?? "-"} / ${ex.rir2 ?? "-"}`,
        proxima_acao: ex.proximaAcao ?? "",
        series_previstas: ex.seriesPrevistas ?? "",
      });
      linhas.push([
        `${s.id}-e${ex.ordem}-s${nSerie}`, // registro_id
        s.id, // sessao_id
        dataTreino, // data_treino (AAAA-MM-DD)
        s.treinoNome, // treino
        ex.id, // exercicio_id
        ex.nome, // exercicio
        ex.ordem, // ordem_exercicio
        nSerie, // numero_serie
        "valida", // tipo_serie
        serie.carga === "" ? "" : serie.carga, // carga_kg
        ex.cargaRef ?? "", // referencia_carga
        serie.reps === "" ? "" : serie.reps, // repeticoes
        serie.rir === "" ? "" : serie.rir, // rir
        ex.obs || "", // observacoes
        snapshot, // prescricao_snapshot
        s.iniciadoEm, // iniciado_em
        fim, // finalizado_em
        enviadoEm, // enviado_em
        "pendente", // status_processamento
        "", // processado_em
        "", // observacoes_processamento
      ]);
    });
  }
  if (linhas.length === 0) {
    throw new Error("Nada para enviar: nenhuma série válida registrada.");
  }
  return { sessaoId: s.id, linhas };
}

type Sheets = sheets_v4.Sheets;

// Idempotência: sessão já existe na coluna B (sessao_id)? Escala ok para
// centenas de linhas; reavaliar se passar de alguns milhares.
export async function sessaoJaEnviada(
  sheets: Sheets,
  spreadsheetId: string,
  sessaoId: string,
): Promise<boolean> {
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${ABA_REGISTROS}!B2:B`,
  });
  const vals = r.data.values ?? [];
  return vals.some((row) => row[0] === sessaoId);
}

export async function anexarRegistros(
  sheets: Sheets,
  spreadsheetId: string,
  linhas: (string | number | "")[][],
): Promise<void> {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${ABA_REGISTROS}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: linhas },
  });
}
