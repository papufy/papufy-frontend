import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
}

/**
 * Borda com brilho sutil (padrão 21st.dev / React Bits) — CSS puro, leve.
 */
export function ShineBorder({
  children,
  className,
  borderRadius = "1rem",
}: ShineBorderProps) {
  return (
    <div
      className={cn("relative p-[1px]", className)}
      style={{ borderRadius }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          borderRadius,
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.55), rgba(59,130,246,0.25), rgba(56,189,248,0.15))",
        }}
        aria-hidden
      />
      <div
        className="relative bg-card"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}
