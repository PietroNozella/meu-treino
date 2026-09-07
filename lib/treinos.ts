import type { Treino } from "./domain";

// Fonte única: planilha via GET /api/treinos. Sem fallback mock —
// falha aparece como erro explícito com retry (app/error.tsx).
export async function carregarTreinos(): Promise<Treino[]> {
  let r: Response;
  try {
    r = await fetch("/api/treinos", { cache: "no-store" });
  } catch {
    throw new Error("Sem conexão. Verifique a internet e tente de novo.");
  }
  if (r.status === 401) {
    throw new Error("Sessão expirada. Entre de novo.");
  }
  if (!r.ok) {
    throw new Error("Falha ao ler a planilha. Tente de novo.");
  }
  const j: unknown = await r.json().catch(() => ({}));
  const treinos = (j as { treinos?: Treino[] }).treinos;
  if (!Array.isArray(treinos) || treinos.length === 0) {
    throw new Error("Planilha sem treinos. Verifique a aba Treino.");
  }
  return treinos;
}

let cache: Promise<Treino[]> | null = null;

// Promise memoizada para uso com `use()` do React 19 (sem effect).
// Limpa o cache ao rejeitar para o retry refazer o fetch.
export function treinosPromise(): Promise<Treino[]> {
  if (!cache) {
    cache = carregarTreinos().catch((e: unknown) => {
      cache = null;
      throw e;
    });
  }
  return cache;
}
