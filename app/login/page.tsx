"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginConteudo() {
  const search = useSearchParams();
  const erro = search.get("error");
  const negado =
    erro === "AccessDenied" || erro === "OAuthAccountNotLinked";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Acesso restrito
      </p>
      <h1 className="text-2xl font-bold">Meu Treino</h1>
      <p className="max-w-60 text-sm text-zinc-400">
        Entre com sua conta Google autorizada para registrar os treinos.
      </p>
      {negado && (
        <p className="max-w-60 rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          Essa conta Google não está autorizada.
        </p>
      )}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="min-h-12 w-full max-w-60 rounded-xl bg-zinc-100 font-bold text-zinc-950 active:scale-[0.98]"
      >
        Entrar com Google
      </button>
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
