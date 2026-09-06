// Mocks derivados da leitura real da planilha em 06/09/2026.
// Aba Treino: blocos UPPER A / LOWER A / UPPER B / LOWER B.
// Histórico usado só para `ultimaObs` resumida. Trocar por GET /api/treinos na etapa 6.
import type { Treino } from "./domain";

export const MOCK_TREINOS: Treino[] = [
  {
    id: "upper-a",
    nome: "Upper A",
    ordem: 1,
    exercicios: [
      { id: "supino-reto", nome: "Supino reto", ordem: 1, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 10, rir1: 2, rir2: 2, proximaAcao: "Subir carga", ultimaObs: "40kg x 10+10, RIR 2/2. Próxima ref: 44kg." },
      { id: "remada-articulada", nome: "Remada articulada fechada (máquina)", ordem: 2, cargaRef: 25, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "crucifixo-halteres", nome: "Crucifixo com halteres", ordem: 3, cargaRef: 12, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps", ultimaObs: "12kg por halter." },
      { id: "puxada-alta", nome: "Puxada alta aberta (polia)", ordem: 4, cargaRef: 50, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 8, rir1: 2, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "elevacao-lateral-polia", nome: "Elevação lateral unilateral (polia)", ordem: 5, cargaRef: 10, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "rosca-direta", nome: "Rosca direta em pé com barra", ordem: 6, cargaRef: 20, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps", ultimaObs: "20kg em anilhas; barra não contabilizada." },
      { id: "triceps-corda", nome: "Tríceps corda (polia)", ordem: 7, cargaRef: 42, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 7, proximaAcao: "Ajustar carga/técnica" },
    ],
  },
  {
    id: "lower-a",
    nome: "Lower A",
    ordem: 2,
    exercicios: [
      { id: "hack", nome: "Agachamento hack", ordem: 1, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 10, rir1: 1, rir2: 1, proximaAcao: "Subir carga" },
      { id: "stiff-halteres", nome: "Stiff / levantamento romeno com halteres", ordem: 2, cargaRef: 10, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 2, rir2: 2, proximaAcao: "Manter carga e progredir reps", ultimaObs: "10kg por halter." },
      { id: "cadeira-extensora", nome: "Cadeira extensora", ordem: 3, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "mesa-flexora", nome: "Mesa flexora", ordem: 4, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 2, rir2: 2, proximaAcao: "Manter carga e progredir reps" },
      { id: "panturrilha-pe", nome: "Panturrilha em pé", ordem: 5, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 10, rir1: 2, rir2: 2, proximaAcao: "Subir carga" },
      { id: "abd-polia-a", nome: "Abdômen na polia", ordem: 6, cargaRef: 25, seriesPrevistas: "2 séries válidas", reps1: 10, reps2: 8, rir1: 2, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
    ],
  },
  {
    id: "upper-b",
    nome: "Upper B",
    ordem: 3,
    exercicios: [
      { id: "supino-inclinado-halteres", nome: "Supino inclinado com halteres", ordem: 1, cargaRef: 14, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 10, rir1: 2, rir2: 0, proximaAcao: "Manter e ganhar margem", ultimaObs: "14kg por halter." },
      { id: "remada-baixa-supinada", nome: "Remada baixa aberta na polia (pegada supinada)", ordem: 2, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 10, rir1: 2, rir2: 2, proximaAcao: "Subir carga" },
      { id: "peck-deck", nome: "Peck deck", ordem: 3, cargaRef: 60, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 8, rir1: 2, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "pulldown", nome: "Pulldown na polia", ordem: 4, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "desenvolvimento", nome: "Desenvolvimento", ordem: 5, cargaRef: 20, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "rosca-bayesiana", nome: "Rosca bayesiana com halter", ordem: 6, cargaRef: 10, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 6, reps2: 8, rir2: 0, proximaAcao: "Ajustar carga/técnica" },
      { id: "triceps-frances-uni", nome: "Tríceps francês unilateral na polia", ordem: 7, cargaRef: 15, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 6, rir1: 0, proximaAcao: "Ajustar carga/técnica" },
    ],
  },
  {
    id: "lower-b",
    nome: "Lower B",
    ordem: 4,
    exercicios: [
      { id: "leg-press", nome: "Leg press", ordem: 1, cargaRef: 120, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 9, rir1: 2, rir2: 0, proximaAcao: "Manter carga e progredir reps", ultimaObs: "120kg total; aquec. 80kg." },
      { id: "elevacao-pelvica", nome: "Elevação pélvica", ordem: 2, cargaRef: 60, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 10, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "cadeira-flexora", nome: "Cadeira flexora", ordem: 3, cargaRef: 25, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 1, rir2: 1, proximaAcao: "Manter carga e progredir reps" },
      { id: "cadeira-abdutora", nome: "Cadeira abdutora", ordem: 4, cargaRef: 20, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
      { id: "panturrilha", nome: "Panturrilha", ordem: 5, cargaRef: 40, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 1, rir2: 1, proximaAcao: "Manter carga e progredir reps" },
      { id: "abd-polia-b", nome: "Abdômen na polia", ordem: 6, cargaRef: 30, seriesPrevistas: "1 aquecimento + 2 válidas", reps1: 8, reps2: 8, rir1: 0, rir2: 0, proximaAcao: "Manter carga e progredir reps" },
    ],
  },
];

export function getTreino(id: string) {
  return MOCK_TREINOS.find((t) => t.id === id);
}
