/** Logo em `frontend/public/nome.png` (servida em `/nome.png`). */
export const PAPUFY_LOGO_SRC = "/nome.png";

type PapufyLogoProps = {
  className?: string;
  alt?: string;
};

export function PapufyLogo({
  className = "h-8 w-auto object-contain",
  alt = "Papufy",
}: PapufyLogoProps) {
  return (
    <img
      src={PAPUFY_LOGO_SRC}
      alt={alt}
      className={className}
      width={120}
      height={32}
      decoding="async"
    />
  );
}
