# Meu Treino — Arquitetura e decisões

## Objetivo
Coletor rápido de séries durante a musculação. Sheets é a fonte de verdade. App não treina, não progride carga, não escreve em abas organizadas.

## Esquema real da planilha (lido em 06/09/2026)
- Planilha: `Treino 3x semana, foco em upper` (título interno atual: `PLANO DE TREINO · 4X/SEMANA`).
- `Treino`: blocos UPPER A / LOWER A / UPPER B / LOWER B. Colunas: Exercício | Carga ref. | Séries | Reps 1 | Reps 2 | RIR 1 | RIR 2 | Próxima ação.
- `Histórico`: Data | Treino | Exercício | Carga | Série 1 | Série 2 | RIR 1 | RIR 2 | Reps totais (fórmula) | Volume válido (fórmula) | Execução | Observações. 62 linhas / 9 sessões na leitura.
- `Resumo`: painel de contadores + regras. Só leitura.
- Regra: app NUNCA escreve em Treino/Histórico/Resumo. Escrita futura só em `Registros do App` (append-only), após autorização explícita do diff.

## Escrita Sheets (implementada, teste real pendente)
`POST /api/registros` (auth + allowlist) recebe `{ sessao }`, valida e faz append na aba `Registros do App` respeitando o header existente (21 cols). `lib/sheets/registros.ts`: `registro_id` determinístico (`sessao-tipo`), `tipo_serie="valida"`, snapshot JSON da prescrição, `status_processamento="pendente"` para o pipeline do ChatGPT. Idempotente por `sessao_id` (lê coluna B antes de anexar). Frontend: erro preserva local com retry; sucesso marca `sincronizada`. Requer SA como **Editor** na planilha.
## Leitura Sheets (implementada, sem mock)
`GET /api/treinos` (auth + allowlist) lê `Treino!B:I` e `Histórico!A:L` via Service Account (`googleapis`, somente servidor). `lib/sheets/mapper.ts` detecta blocos por nome (nunca posição), ignora headers/notas e anexa `ultimaObs` com match por treino+exercício, fallback por tokens (divergências tipo "Abdômen na polia" vs "Abdômen polia"). Frontend (`lib/treinos.ts`) usa a planilha como fonte única; falha exibe `app/error.tsx` com retry (cache limpo). Rotas dinâmicas (`force-dynamic` no layout). Envs: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`. Planilha compartilhada com a SA como Editor; Sheets API ativa no projeto.

## Estrutura
- `app/page.tsx`: home, lista treinos, continuar/descartar sessão ativa.
- `app/treino/[id]/page.tsx`: execução + resumo + envio real. Foco em poucos toques: carga pré-preenchida, repetir anterior, steppers, +série (até 4), obs por exercício, progresso, autosave.
- `lib/domain.ts`: tipos Sessao/Exercicio/Serie/RegistroBruto + `sessaoParaRegistros` + `volumeSessao`.
- `lib/store.ts`: localStorage (`meu-treino:sessao:<uuid>` + ponteiro ativa). Sobrevive a refresh e queda de internet.
- `public/manifest.webmanifest` + `icon.svg`: PWA instalável, standalone, portrait, safe-area via `viewport-fit=cover`.

## Modelo de envio (futuro)
Uma linha por série válida em `Registros do App`: session_id | iniciado_em | finalizado_em | treino_id | treino_nome | exercicio_nome | ordem_exercicio | serie | carga | reps | rir | obs | carga_ref_snapshot | reps_ref_snapshot | rir_ref_snapshot | proxima_acao_snapshot | app_version.
Idempotência por `session_id` (uuid no início, snapshot congelado). Nunca marca sincronizada sem 200 do servidor.

## Auth (implementada)
NextAuth v4 + provider Google + `ALLOWED_EMAILS` (allowlist). `signIn` nega conta fora da lista; `middleware.ts` (withAuth) protege páginas e `/api/*` e revalida a lista por request — remover o e-mail da lista revoga o acesso. Sessão em cookie httpOnly. Segredos só em env (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `ALLOWED_EMAILS`, `NEXTAUTH_URL` só em prod). Redirects OAuth a cadastrar no Google Cloud: `http://localhost:3000/api/auth/callback/google` e `https://<app>.vercel.app/api/auth/callback/google`.

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
