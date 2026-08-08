function trimUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.replace(/\/$/, "") : undefined;
}

const PUBLIC_CONFIG_ERROR =
  "Não foi possível iniciar o Papufy. Tente recarregar a página.";

function assertProductionApiUrl(url: string): string {
  if (!url.startsWith("https://")) {
    console.error("[env] VITE_API_URL deve ser HTTPS.");
    throw new Error(PUBLIC_CONFIG_ERROR);
  }
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    console.error("[env] VITE_API_URL não pode ser localhost.");
    throw new Error(PUBLIC_CONFIG_ERROR);
  }
  return url;
}

export function getApiBaseUrl(): string {
  const url = trimUrl(import.meta.env.VITE_API_URL);
  if (!url) {
    console.error("[env] VITE_API_URL não configurada.");
    throw new Error(PUBLIC_CONFIG_ERROR);
  }
  return assertProductionApiUrl(url);
}

export function getWebSocketBaseUrl(): string {
  const ws = trimUrl(import.meta.env.VITE_WS_URL);
  if (ws?.startsWith("wss://")) {
    if (/localhost|127\.0\.0\.1/i.test(ws)) {
      console.error("[env] VITE_WS_URL não pode ser localhost.");
      throw new Error(
        "Não foi possível conectar ao chat. Tente recarregar a página."
      );
    }
    return ws;
  }

  const api = getApiBaseUrl();
  return api.replace(/^https/, "wss");
}
