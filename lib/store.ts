// Persistência local — sessão em andamento sobrevive a refresh / queda de internet.
// Chave única por sessão; índice "ativa" para continuar ao reabrir.
"use client";

import type { Sessao, Treino, TreinoId } from "./domain";
import { MOCK_TREINOS } from "./mock";
import { novaSerie } from "./domain";

const PREFIXO = "meu-treino:sessao:";
const ATIVA = "meu-treino:sessao-ativa";

export function criarSessaoDe(treino: Treino): Sessao {
  const sessao: Sessao = {
    id: crypto.randomUUID(),
    treinoId: treino.id,
    treinoNome: treino.nome,
    iniciadoEm: new Date().toISOString(),
    prescricaoSnapshot: treino.exercicios,
    exercicios: treino.exercicios.map((ex) => ({
      ...ex,
      series: [novaSerie(1, ex.cargaRef), novaSerie(2, ex.cargaRef)],
      obs: "",
    })),
    status: "em_andamento",
  };
  salvarSessao(sessao);
  try {
    localStorage.setItem(ATIVA, sessao.id);
  } catch {}
  return sessao;
}

export function criarSessao(treinoId: TreinoId): Sessao {
  const treino = MOCK_TREINOS.find((t) => t.id === treinoId);
  if (!treino) throw new Error(`Treino desconhecido: ${treinoId}`);
  return criarSessaoDe(treino);
}

export function salvarSessao(s: Sessao) {
  try {
    localStorage.setItem(PREFIXO + s.id, JSON.stringify(s));
  } catch {}
}

export function carregarSessao(id: string): Sessao | null {
  try {
    const raw = localStorage.getItem(PREFIXO + id);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

export function sessaoAtiva(): Sessao | null {
  try {
    const id = localStorage.getItem(ATIVA);
    return id ? carregarSessao(id) : null;
  } catch {
    return null;
  }
}

export function limparSessaoAtiva() {
  try {
    localStorage.removeItem(ATIVA);
  } catch {}
}

export function descartarSessao(id: string) {
  try {
    localStorage.removeItem(PREFIXO + id);
    if (localStorage.getItem(ATIVA) === id) localStorage.removeItem(ATIVA);
  } catch {}
}
