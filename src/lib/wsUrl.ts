export function getWebSocketUrl(token: string): string {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured && typeof configured === "string" && configured.startsWith("ws")) {
    const base = configured.replace(/\/$/, "");
    return `${base}?token=${encodeURIComponent(token)}`;
  }

  const api = import.meta.env.VITE_API_URL;
  if (api && typeof api === "string" && api.startsWith("http")) {
    const wsBase = api.replace(/^http/, "ws").replace(/\/$/, "");
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  }

  throw new Error(
    "VITE_WS_URL ou VITE_API_URL não configuradas na Vercel."
  );
}
