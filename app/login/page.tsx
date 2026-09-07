"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RegistroMark from "@/components/RegistroMark";

function LoginConteudo() {
  const search = useSearchParams();
  const erro = search.get("error");
  const negado = erro === "AccessDenied" || erro === "OAuthAccountNotLinked";

  return (
    <main className="centered-page items-start py-8">
      <RegistroMark size={52} />
      <p className="eyebrow mt-7">Sua planilha, com menos toques</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">
        Meu Treino<span className="text-neutral-500">.</span>
      </h1>
      <p className="mt-4 max-w-72 text-base leading-relaxed text-neutral-400">
        Um lugar simples para registrar suas séries e seguir o treino.
      </p>
      {erro && (
        <p
          role="alert"
          className="mt-6 w-full rounded-2xl border border-neutral-600 p-4 text-sm text-neutral-300"
        >
          {negado
            ? "Essa conta Google não está autorizada."
            : "Não foi possível entrar. Tente novamente com sua conta Google."}
        </p>
      )}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="button-primary mt-8 w-full"
      >
        Entrar com Google
      </button>
      <p className="mt-4 w-full text-center text-xs text-neutral-400">
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
