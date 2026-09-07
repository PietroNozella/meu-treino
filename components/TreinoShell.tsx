"use client";

import dynamic from "next/dynamic";

// Client-only: o fetch relativo de /api/treinos não existe no SSR.
const TreinoClient = dynamic(() => import("./TreinoClient"), {
  ssr: false,
  loading: () => (
    <main className="pt-8 text-center text-sm text-zinc-400">
      Carregando treino…
    </main>
  ),
});

export default function TreinoShell({
  id,
  sessaoParam,
}: {
  id: string;
  sessaoParam: string | null;
}) {
  return <TreinoClient id={id} sessaoParam={sessaoParam} />;
}
