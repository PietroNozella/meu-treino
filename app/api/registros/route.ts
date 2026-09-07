import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEmailAllowed } from "@/lib/allowlist";
import type { Sessao } from "@/lib/domain";
import { getSheets } from "@/lib/sheets/client";
import {
  anexarRegistros,
  sessaoJaEnviada,
  sessaoParaLinhas,
} from "@/lib/sheets/registros";

// Recebe a sessão completa (snapshot congelado no app) e faz append
// na aba `Registros do App`. Nunca toca em Treino/Histórico/Resumo.
// Idempotente por sessao_id: reenvio retorna ok sem duplicar.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isEmailAllowed(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  let sessao: Sessao;
  try {
    const body: unknown = await req.json();
    sessao = (body as { sessao?: Sessao }).sessao as Sessao;
    if (!sessao || typeof sessao !== "object") throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Corpo inválido: esperado { sessao }." },
      { status: 400 },
    );
  }

  let linhas;
  try {
    linhas = sessaoParaLinhas(sessao, new Date().toISOString());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sessão inválida.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const { sheets, spreadsheetId } = getSheets();
    if (await sessaoJaEnviada(sheets, spreadsheetId, linhas.sessaoId)) {
      return NextResponse.json({
        ok: true,
        deduped: true,
        sessao_id: linhas.sessaoId,
        series: 0,
      });
    }
    await anexarRegistros(sheets, spreadsheetId, linhas.linhas);
    return NextResponse.json({
      ok: true,
      deduped: false,
      sessao_id: linhas.sessaoId,
      series: linhas.linhas.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gravar.";
    const status = /403|permiss|permission/i.test(msg) ? 502 : 500;
    return NextResponse.json(
      { error: `Sheets: ${msg}` },
      { status },
    );
  }
}
