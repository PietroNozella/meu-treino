export default function Loading() {
  return (
    <main
      role="status"
      className="centered-page text-secondary items-center gap-4 text-sm"
    >
      <span
        aria-hidden="true"
        className="loading-spinner h-8 w-8"
      />
      Carregando seus treinos…
    </main>
  );
}
