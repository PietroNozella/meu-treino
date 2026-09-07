import type { PrescricaoExercicio, Treino, TreinoId } from "../domain";

// Parser defensivo da aba Treino (lida como Treino!B:I):
// B Exercício | C Carga ref | D Séries | E Reps1 | F Reps2 | G RIR1 | H RIR2 | I Próxima ação.
// Blocos detectados pelo nome (UPPER A / LOWER A / UPPER B / LOWER B),
// nunca por posição fixa — a planilha pode ganhar linhas.
const BLOCOS: Record<string, { id: TreinoId; nome: string; ordem: number }> = {
  "upper a": { id: "upper-a", nome: "Upper A", ordem: 1 },
  "lower a": { id: "lower-a", nome: "Lower A", ordem: 2 },
  "upper b": { id: "upper-b", nome: "Upper B", ordem: 3 },
  "lower b": { id: "lower-b", nome: "Lower B", ordem: 4 },
};

function num(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."));
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function txt(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return undefined;
}

export function parseTreino(values: unknown[][]): Treino[] {
  const treinos: Treino[] = [];
  let atual: Treino | null = null;

  for (const row of values) {
    const [ex, carga, series, reps1, reps2, rir1, rir2, proxima] = row;
    const nome = txt(ex);
    if (!nome) continue;

    const bloco = BLOCOS[nome.toLowerCase()];
    if (bloco) {
      atual = { id: bloco.id, nome: bloco.nome, ordem: bloco.ordem, exercicios: [] };
      treinos.push(atual);
      continue;
    }
    if (!atual) continue;
    if (nome.toLowerCase() === "exercício" || nome.toLowerCase() === "exercicio") continue;

    const seriesTxt = txt(series) ?? "";
    // Linha de exercício: tem prescrição de séries OU carga de referência.
    if (!seriesTxt.includes("válida") && num(carga) === undefined) continue;

    atual.exercicios.push({
      id: slug(nome),
      nome,
      ordem: atual.exercicios.length + 1,
      cargaRef: num(carga),
      seriesPrevistas: seriesTxt || "2 séries válidas",
      reps1: num(reps1),
      reps2: num(reps2),
      rir1: num(rir1),
      rir2: num(rir2),
      proximaAcao: txt(proxima),
    });
  }
  return treinos.sort((a, b) => a.ordem - b.ordem);
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Última observação por exercício a partir do Histórico (lido como Histórico!B:D + L?
// Na prática lemos A:L e usamos Treino(B), Exercício(C), Observações(L)).
// Nomes divergem um pouco entre abas ("(máquina)" vs "máquina"), por isso
// a normalização ignora parênteses e pontuação.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP = new Set(["na", "no", "nas", "nos", "da", "do", "das", "dos", "de", "e", "a", "o"]);

function tokens(s: string): string[] {
  return norm(s).split(" ").filter((t) => t.length > 2 && !STOP.has(t));
}

// Fallback por tokens para divergências entre abas
// ("Abdômen na polia" vs "Abdômen polia", "(máquina)" vs "máquina").
function acharObs(
  scoped: Map<string, string>,
  geral: Map<string, string>,
  treinoNome: string,
  exNome: string,
): string | undefined {
  const ex = norm(exNome);
  // Exato só vale no mesmo treino — o geral exato pode ser de outro treino
  // (ex.: "Abdômen na polia" existe em Lower A e B com obs diferentes).
  const exato = scoped.get(`${norm(treinoNome)}|${ex}`);
  if (exato) return exato;
  const q = tokens(exNome);
  if (q.length === 0) return undefined;
  const treino = norm(treinoNome);
  const casa = (chave: string) => {
    const k = chave.includes("|") ? chave.split("|")[1] : chave;
    const kt = tokens(k);
    return (
      q.every((t) => kt.includes(t)) || kt.every((t) => q.includes(t))
    );
  };
  // Passada 1: mesmo treino. Passada 2: qualquer treino. Última sessão vence.
  let achada: string | undefined;
  for (const [k, v] of scoped) {
    if (k.startsWith(treino + "|") && casa(k)) achada = v;
  }
  if (achada) return achada;
  for (const [k, v] of scoped) if (casa(k)) achada = v;
  if (achada) return achada;
  for (const [k, v] of geral) if (casa(k)) achada = v;
  return achada;
}

export function anexarUltimasObs(
  treinos: Treino[],
  historico: unknown[][],
): Treino[] {
  // Pula header: primeira linha com "Data" na col A.
  const linhas = historico[0]?.[0] === "Data" ? historico.slice(1) : historico;
  // Duas chaves: "treino|exercício" (ex.: abdômen aparece em Lower A e B)
  // e só "exercício" como fallback. Última sessão vence (ordem cronológica).
  const scoped = new Map<string, string>();
  const geral = new Map<string, string>();
  for (const row of linhas) {
    const treino = txt(row[1]);
    const exercicio = txt(row[2]);
    const obs = txt(row[11]);
    if (!exercicio || !obs) continue;
    const ex = norm(exercicio);
    geral.set(ex, obs);
    if (treino) scoped.set(`${norm(treino)}|${ex}`, obs);
  }
  if (geral.size === 0) return treinos;

  return treinos.map((t) => ({
    ...t,
    exercicios: t.exercicios.map(
      (e): PrescricaoExercicio => ({
        ...e,
        ultimaObs: acharObs(scoped, geral, t.nome, e.nome) ?? e.ultimaObs,
      }),
    ),
  }));
}
