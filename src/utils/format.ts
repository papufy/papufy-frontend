export function formatPrice(preco: number | null, aCombinar: boolean): string {
  if (preco != null) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(preco);
  }
  if (aCombinar) {
    return "A combinar";
  }
  return "Preço não informado";
}

/** Faixa de preço (profissional) ou preço único (pedido). */
export function formatListingPrice(listing: {
  preco?: number | null;
  precoMin?: number | null;
  precoMax?: number | null;
  aCombinar?: boolean;
}): string {
  const min = listing.precoMin ?? null;
  const max = listing.precoMax ?? null;
  if (min != null && max != null && min > 0 && max > 0) {
    if (min === max) return formatPrice(min, false);
    return `${formatPrice(min, false)} – ${formatPrice(max, false)}`;
  }
  if (min != null && min > 0) return `A partir de ${formatPrice(min, false)}`;
  if (max != null && max > 0) return `Até ${formatPrice(max, false)}`;
  return formatPrice(listing.preco ?? null, listing.aCombinar ?? false);
}

export function formatLocation(cidade: string, uf: string, bairro?: string | null): string {
  const base = `${cidade}, ${uf}`;
  return bairro ? `${bairro} · ${base}` : base;
}

/** Rótulo de validade do anúncio (dono). */
export function formatListingValidity(expiresAt?: string | null): {
  label: string;
  expired: boolean;
} {
  if (!expiresAt) {
    return { label: "Prazo a confirmar", expired: false };
  }
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) {
    return { label: "Prazo a confirmar", expired: false };
  }
  const expired = end.getTime() <= Date.now();
  const dateLabel = end.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return {
    label: expired ? `Expirado em ${dateLabel}` : `Válido até ${dateLabel}`,
    expired,
  };
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

export function formatMemberSince(dateIso: string): string {
  const date = new Date(dateIso);
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const year = date.getFullYear();
  return `No Papufy desde ${month} de ${year}`;
}

export function formatLastAccess(dateIso?: string | null): string {
  if (!dateIso) return "Último acesso não disponível";
  const relative = formatRelativeTime(dateIso);
  if (relative === "Agora") return "Último acesso agora";
  return `Último acesso ${relative.charAt(0).toLowerCase()}${relative.slice(1)}`;
}
