"use client";

import { useEffect } from "react";

// Boundary global: captura falha de leitura da planilha (e outros erros
// de render) e oferece retry. Sessão em andamento continua salva no
// localStorage — nada se perde.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Algo falhou
      </p>
      <h1 className="text-xl font-bold">Não foi possível carregar</h1>
      <p className="max-w-60 text-sm text-zinc-400">
        {error.message || "Verifique a internet e tente de novo."}
      </p>
      <button
        onClick={() => reset()}
        className="min-h-12 w-full max-w-60 rounded-xl bg-zinc-100 font-bold text-zinc-950 active:scale-[0.98]"
      >
        Tentar de novo
      </button>
    </main>
  );
}
