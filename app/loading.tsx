export default function Loading() {
  return (
    <main
      role="status"
      className="centered-page items-center gap-4 text-sm text-neutral-400"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-pulse rounded-xl border border-neutral-600"
      />
      Carregando seus treinos…
    </main>
  );
}
