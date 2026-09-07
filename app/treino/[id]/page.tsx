import TreinoShell from "@/components/TreinoShell";

export default async function TreinoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessao?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return <TreinoShell id={id} sessaoParam={sp.sessao ?? null} />;
}
