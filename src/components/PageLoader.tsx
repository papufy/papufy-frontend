import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div
      className="flex min-h-[40dvh] flex-col items-center justify-center gap-4 px-6"
      role="status"
      aria-label="Carregando página"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
