// Persistência local — sessão em andamento sobrevive a refresh / queda de internet.
// Chave única por sessão; índice "ativa" para continuar ao reabrir.
"use client";

import type { Sessao, Treino } from "./domain";
import { novaSerie } from "./domain";

const PREFIXO = "meu-treino:sessao:";
const ATIVA = "meu-treino:sessao-ativa";
const FOCO = "meu-treino:foco:";

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

export function salvarSessao(s: Sessao) {
  try {
    localStorage.setItem(PREFIXO + s.id, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
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
    localStorage.removeItem(FOCO + id);
    if (localStorage.getItem(ATIVA) === id) localStorage.removeItem(ATIVA);
  } catch {}
}

export function salvarFoco(sessaoId: string, idx: number) {
  try {
    localStorage.setItem(FOCO + sessaoId, String(idx));
  } catch {}
}

export function carregarFoco(sessaoId: string): number {
  try {
    const v = Number(localStorage.getItem(FOCO + sessaoId));
    return Number.isInteger(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}
