function trimUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.replace(/\/$/, "") : undefined;
}

function assertProductionApiUrl(url: string): string {
  if (!url.startsWith("https://")) {
    throw new Error("VITE_API_URL deve ser HTTPS (URL do Render em produção).");
  }
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    throw new Error("URL local não permitida — configure a API do Render na Vercel.");
  }
  return url;
}

export function getApiBaseUrl(): string {
  const url = trimUrl(import.meta.env.VITE_API_URL);
  if (!url) {
    throw new Error(
      "VITE_API_URL não configurada. Defina a URL do backend Render na Vercel (Production + Preview)."
    );
  }
  return assertProductionApiUrl(url);
}

export function getWebSocketBaseUrl(): string {
  const ws = trimUrl(import.meta.env.VITE_WS_URL);
  if (ws?.startsWith("wss://")) {
    if (/localhost|127\.0\.0\.1/i.test(ws)) {
      throw new Error("VITE_WS_URL não pode apontar para localhost.");
    }
    return ws;
  }

  const api = getApiBaseUrl();
  return api.replace(/^https/, "wss");
}
