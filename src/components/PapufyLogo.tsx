import { useState } from "react";

/** Logo em `frontend/public/nome.png` (servida em `/nome.png`). */
export const PAPUFY_LOGO_SRC = "/nome.png";

type PapufyLogoProps = {
  className?: string;
  /** Usado só se a imagem não carregar (substitui a logo por texto). */
  alt?: string;
};

export function PapufyLogo({
  className = "h-8 w-auto object-contain",
  alt = "Papufy",
}: PapufyLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span
        className={`font-display text-xl font-extrabold tracking-tight text-sky-500 ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        {alt}
      </span>
    );
  }

  return (
    <img
      src={PAPUFY_LOGO_SRC}
      alt={alt}
      className={className}
      width={160}
      height={44}
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  );
}
