"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/loading";

// Client-only: o fetch relativo de /api/treinos não existe no SSR.
const TreinoClient = dynamic(() => import("./TreinoClient"), {
  ssr: false,
  loading: Loading,
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
