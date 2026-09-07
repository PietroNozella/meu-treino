"use client";

import dynamic from "next/dynamic";
import Loading from "./loading";

// A sessão ativa depende do armazenamento deste aparelho.
const HomeClient = dynamic(() => import("@/components/HomeClient"), {
  ssr: false,
  loading: Loading,
});

export default function Home() {
  return <HomeClient />;
}
