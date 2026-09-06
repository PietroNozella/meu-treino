# Meu Treino — Arquitetura e decisões

## Objetivo
Coletor rápido de séries durante a musculação. Sheets é a fonte de verdade. App não treina, não progride carga, não escreve em abas organizadas.

## Esquema real da planilha (lido em 06/09/2026)
- Planilha: `Treino 3x semana, foco em upper` (título interno atual: `PLANO DE TREINO · 4X/SEMANA`).
- `Treino`: blocos UPPER A / LOWER A / UPPER B / LOWER B. Colunas: Exercício | Carga ref. | Séries | Reps 1 | Reps 2 | RIR 1 | RIR 2 | Próxima ação.
- `Histórico`: Data | Treino | Exercício | Carga | Série 1 | Série 2 | RIR 1 | RIR 2 | Reps totais (fórmula) | Volume válido (fórmula) | Execução | Observações. 62 linhas / 9 sessões na leitura.
- `Resumo`: painel de contadores + regras. Só leitura.
- Regra: app NUNCA escreve em Treino/Histórico/Resumo. Escrita futura só em `Registros do App` (append-only), após autorização explícita do diff.

## Stack
Next 16.3.4 + React 19 + TS + Tailwind 4 + Vercel. `googleapis` + Auth.js entram nas etapas 5–7. Zero libs novas até aqui.

## Estrutura
- `app/page.tsx`: home, lista treinos, continuar/descartar sessão ativa.
- `app/treino/[id]/page.tsx`: execução + resumo + envio mock. Foco em poucos toques: carga pré-preenchida, repetir anterior, steppers, +série (até 4), obs por exercício, progresso, autosave.
- `lib/domain.ts`: tipos Sessao/Exercicio/Serie/RegistroBruto + `sessaoParaRegistros` + `volumeSessao`.
- `lib/mock.ts`: dados copiados da planilha real (trocar por GET /api/treinos na etapa 6).
- `lib/store.ts`: localStorage (`meu-treino:sessao:<uuid>` + ponteiro ativa). Sobrevive a refresh e queda de internet.
- `public/manifest.webmanifest` + `icon.svg`: PWA instalável, standalone, portrait, safe-area via `viewport-fit=cover`.

## Modelo de envio (futuro)
Uma linha por série válida em `Registros do App`: session_id | iniciado_em | finalizado_em | treino_id | treino_nome | exercicio_nome | ordem_exercicio | serie | carga | reps | rir | obs | carga_ref_snapshot | reps_ref_snapshot | rir_ref_snapshot | proxima_acao_snapshot | app_version.
Idempotência por `session_id` (uuid no início, snapshot congelado). Nunca marca sincronizada sem 200 do servidor.

## Auth (etapa 5, planejada)
Auth.js provider Google + `ALLOWED_EMAILS` + middleware em `/` e `/api/*`. Service Account só com acesso à planilha. Segredos só em env, nunca no repo.

## Rodar local
```bash
cd D:\Projetos\Pessoais\meu-treino
npm install
npm run dev
# http://localhost:3000
```

## Deploy Vercel (etapa 8)
Importar repo GitHub, root `meu-treino`, sem env por enquanto (mock). Env futuras: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID, GOOGLE_CLIENT_ID/SECRET, ALLOWED_EMAILS, NEXTAUTH_SECRET.

## Próximos passos
1. Auth real. 2. GET Treino+Histórico. 3. POST Registros do App (com diff autorizado). 4. Ícones PNG 180/192/512 + SW mínimo + teste Tela de Início.
