"use client";

import { useEffect } from "react";
import { limparCacheTreinos } from "@/lib/treinos";

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
    <main className="centered-page gap-4">
      <p className="eyebrow">Vamos tentar novamente</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Não foi possível carregar.
      </h1>
      <p role="alert" className="text-secondary text-sm leading-relaxed">
        {error.message || "Verifique a internet e tente de novo."}
      </p>
      <button
        onClick={() => {
          limparCacheTreinos();
          reset();
        }}
        className="button-primary mt-3 w-full"
      >
        Tentar de novo
      </button>
    </main>
  );
}
