export function PageLoader() {
  return (
    <div
      className="flex min-h-[40dvh] items-center justify-center"
      role="status"
      aria-label="Carregando página"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
    </div>
  );
}
