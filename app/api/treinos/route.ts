import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isEmailAllowed } from "@/lib/allowlist";
import { getSheets } from "@/lib/sheets/client";
import { anexarUltimasObs, parseTreino } from "@/lib/sheets/mapper";

// Leitura fresca da prescrição + últimas observações. Somente leitura;
// nunca escreve na planilha.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isEmailAllowed(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const { sheets, spreadsheetId } = getSheets();
    const [treino, historico] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Treino!B:I",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Histórico!A:L",
      }),
    ]);
    const treinos = anexarUltimasObs(
      parseTreino(treino.data.values ?? []),
      historico.data.values ?? [],
    );
    return NextResponse.json({ treinos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao ler planilha.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
