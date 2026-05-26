import { getWebSocketBaseUrl } from "./env";

export function getWebSocketUrl(token: string): string {
  const base = getWebSocketBaseUrl();
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}
