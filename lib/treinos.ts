import type { Treino } from "./domain";
import { MOCK_TREINOS } from "./mock";

export interface Carregamento {
  treinos: Treino[];
  fonte: "planilha" | "mock";
}

// Tenta a planilha via GET /api/treinos; qualquer falha cai para o mock
// (lista real mapeada) para nunca travar o treino por rede/auth Sheets.
export async function carregarTreinos(): Promise<Carregamento> {
  try {
    const r = await fetch("/api/treinos", { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j: unknown = await r.json();
    const treinos = (j as { treinos?: Treino[] }).treinos;
    if (!Array.isArray(treinos) || treinos.length === 0) {
      throw new Error("Resposta vazia.");
    }
    return { treinos, fonte: "planilha" };
  } catch {
    return { treinos: MOCK_TREINOS, fonte: "mock" };
  }
}

let cache: Promise<Carregamento> | null = null;

// Promise memoizada para uso com `use()` do React 19 (sem effect).
export function treinosPromise(): Promise<Carregamento> {
  if (!cache) cache = carregarTreinos();
  return cache;
}
