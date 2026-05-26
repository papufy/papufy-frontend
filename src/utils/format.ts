export function formatPrice(preco: number | null, aCombinar: boolean): string {
  if (aCombinar || preco == null) {
    return "A combinar";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(preco);
}

export function formatLocation(cidade: string, uf: string, bairro?: string | null): string {
  const base = `${cidade}, ${uf}`;
  return bairro ? `${bairro} · ${base}` : base;
}

export function formatRelativeTime(dateIso: string): string {
  const date = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
