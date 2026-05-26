import DOMPurify from "dompurify";

/**
 * Higieniza HTML antes de qualquer renderização perigosa.
 * Para texto puro do chat/feed, prefira <SafeText /> (sem HTML).
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function sanitizePlainText(value: string, maxLength = 5000): string {
  return sanitizeHtml(value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}
