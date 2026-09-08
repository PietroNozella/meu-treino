"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import RegistroMark from "@/components/RegistroMark";

function LoginConteudo() {
  const search = useSearchParams();
  const erro = search.get("error");
  const negado = erro === "AccessDenied" || erro === "OAuthAccountNotLinked";
  const [entrando, setEntrando] = useState(false);

  return (
    <main className="centered-page items-start py-8">
      <RegistroMark size={52} />
      <p className="eyebrow mt-7">Seu treino, do seu jeito</p>
      <h1 className="display-title mt-3">
        Meu Treino<span className="text-tertiary">.</span>
      </h1>
      <p className="text-secondary mt-4 max-w-72 text-base leading-relaxed">
        Registre suas séries, acompanhe o ritmo e siga em frente.
      </p>
      {erro && (
        <p
          role="alert"
          className="border-strong text-secondary radius-md mt-6 w-full border p-4 text-sm"
        >
          {negado
            ? "Essa conta Google não está autorizada."
            : "Não foi possível entrar. Tente novamente com sua conta Google."}
        </p>
      )}
      <button
        onClick={async () => {
          setEntrando(true);
          try {
            await signIn("google", { callbackUrl: "/" });
          } finally {
            setEntrando(false);
          }
        }}
        disabled={entrando}
        aria-busy={entrando}
        className="button-primary mt-8 w-full"
      >
        {entrando && <span className="loading-spinner" aria-hidden="true" />}
        <span>{entrando ? "Entrando com Google…" : "Entrar com Google"}</span>
      </button>
      <p className="text-secondary mt-4 w-full text-center text-xs">
        Use sua conta Google autorizada.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginConteudo />
    </Suspense>
  );
}
