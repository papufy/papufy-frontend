import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RELOAD_KEY = "papufy_chunk_reload";

function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg)
  );
}

/** Após deploy, hashes dos chunks mudam — recarrega 1x para pegar o index novo. */
function reloadOnceForStaleChunk(): void {
  try {
    const already = sessionStorage.getItem(RELOAD_KEY);
    if (already === "1") return;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    /* ignore */
  }
  window.location.reload();
}

export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      clearChunkReloadFlag();
      return mod;
    } catch (err) {
      if (isChunkLoadError(err)) {
        reloadOnceForStaleChunk();
      }
      throw err;
    }
  });
}

export { isChunkLoadError, reloadOnceForStaleChunk };
