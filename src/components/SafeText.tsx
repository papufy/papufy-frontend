import { sanitizePlainText } from "../lib/safeContent";

interface SafeTextProps {
  children: string;
  className?: string;
  as?: "p" | "span" | "div";
}

/**
 * Renderiza texto sem HTML — proteção XSS (React já escapa, esta camada remove markup residual).
 */
export function SafeText({
  children,
  className,
  as: Tag = "span",
}: SafeTextProps) {
  const safe = sanitizePlainText(children);
  return <Tag className={className}>{safe}</Tag>;
}
