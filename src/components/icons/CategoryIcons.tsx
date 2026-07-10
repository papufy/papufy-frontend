import type { ReactElement } from "react";

interface IconProps {
  className?: string;
}

export type CategoryIconKey =
  | "sparkles"
  | "clipboard"
  | "briefcase"
  | "bag"
  | "wrench"
  | "crane"
  | "broom"
  | "monitor"
  | "book"
  | "party"
  | "phone"
  | "sofa"
  | "car"
  | "shirt"
  | "ball"
  | "plant"
  | "box"
  | "pin";

export function IconSparkles({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.5 3.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
      <path d="M16.2 8.2l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
      <path d="M14.5 15.2l.55 1.55 1.55.55-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55z" />
    </svg>
  );
}

export function IconClipboard({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3.5h6a1.5 1.5 0 011.5 1.5v1H18a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h1.5V5A1.5 1.5 0 019 3.5zm0 1.5v1h6V5H9zm-1 5.25h8a.75.75 0 010 1.5H8a.75.75 0 010-1.5zm0 3.25h8a.75.75 0 010 1.5H8a.75.75 0 010-1.5zm0 3.25h5.5a.75.75 0 010 1.5H8a.75.75 0 010-1.5z" />
    </svg>
  );
}

export function IconProfessional({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.5a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zm0 1.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
      <path d="M12 12c-3.9 0-7 2.5-7 5.75 0 .7.55 1.25 1.25 1.25h11.5c.7 0 1.25-.55 1.25-1.25C19 14.5 15.9 12 12 12zm0 1.5c2.7 0 4.9 1.45 5.35 3.25H6.65C7.1 14.95 9.3 13.5 12 13.5z" />
      <path d="M11.25 13.75h1.5L14 17.5h-1.35l-.4-1.25h-.5L11.35 17.5H10l1.25-3.75z" />
    </svg>
  );
}

export function IconBag({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.5 7V6a3.5 3.5 0 017 0v1H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2.5zm1.5 0h4V6a2 2 0 10-4 0v1zM6 9v10h12V9H6z" />
    </svg>
  );
}

export function IconWrench({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 6.2a4.7 4.7 0 01-6.4 4.35l-7.7 7.7a1.75 1.75 0 11-2.45-2.45l7.7-7.7A4.7 4.7 0 0117.8 3.5c.4 0 .8.05 1.15.15l-2.3 2.3 2.2 2.2 2.3-2.3c.1.35.15.75.15 1.15z" />
    </svg>
  );
}

export function IconCrane({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 21h14v-1.5H5V21zm2.5-1.5h2V10.5h7.25L17.5 14H19l-1.1-4.5H20V8H7.5v11.5zm2-9.5h8.5V8.5h-8.5V10z" />
      <path d="M7.75 8h1.5V5.2L15.5 3.8V2.2L7.75 4.1V8z" />
      <path d="M16.25 14.25h2.5v1.25h-2.5V14.25zm.4 1.25h1.7V19h-1.7v-3.5z" />
    </svg>
  );
}

export function IconBroom({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.2 3.3l1.5 1.5-5.4 5.4 2.1 2.1 5.4-5.4 1.5 1.5-6.2 6.2-3.6-3.6 4.7-7.7z" />
      <path d="M5.2 14.8l4 4c.4.4.4 1 0 1.4l-.7.7c-1.6 1.6-4.3 1.4-5.6-.3C1.5 18.8 2 16 3.8 14.5l.7-.7c.4-.4 1-.4 1.4 0l-.7.7-.7.7c-1 1-.8 2.6.3 3.7 1.1 1.1 2.7 1.3 3.7.3l.7-.7-.7-.7-2.6-2.6-.7-.7z" />
    </svg>
  );
}

export function IconMonitor({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 5.5h16a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0120 17.5h-6.25v1.5H16a.75.75 0 010 1.5H8a.75.75 0 010-1.5h2.25V17.5H4A1.5 1.5 0 012.5 16V7A1.5 1.5 0 014 5.5zm0 1.5v9h16V7H4z" />
    </svg>
  );
}

export function IconBook({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 4.5h10A2.5 2.5 0 0119 7v12.2l-6.5-2.4L6 19.2V7a2.5 2.5 0 012.5-2.5h-2zm0 1.5A1 1 0 005.5 7v10.3l5.5-2 5.5 2V7a1 1 0 00-1-1h-9z" />
    </svg>
  );
}

export function IconParty({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.2 3.8l1.1.4-.4 1.1-.4-1.1 1.1-.4-1.1-.4.4-1.1.4 1.1zM16.5 5l.9.35-.35.9-.35-.9.9-.35-.9-.35.35-.9.35.9zM4.5 9.5l12.2 4.1-1.4 4.1L3.1 13.6 4.5 9.5zm2.2 1.7l-.7 2 8.4 2.8.7-2-8.4-2.8zM14 18.5l1.8-1.2 1.2 1.8-1.8 1.2-1.2-1.8z" />
    </svg>
  );
}

export function IconPhone({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.5 2.5h7A2.5 2.5 0 0118 5v14a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 016 19V5A2.5 2.5 0 018.5 2.5zM8 5v14a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1zm3.25 12.25h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5z" />
    </svg>
  );
}

export function IconSofa({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 9.5V8a3 3 0 013-3h6a3 3 0 013 3v1.5a2.5 2.5 0 012.5 2.5V16a1.5 1.5 0 01-1.5 1.5H18v1.25a.75.75 0 01-1.5 0V17.5h-9v1.25a.75.75 0 01-1.5 0V17.5H5A1.5 1.5 0 013.5 16v-4A2.5 2.5 0 016 9.5zm1.5 0h9V8a1.5 1.5 0 00-1.5-1.5H9A1.5 1.5 0 007.5 8v1.5z" />
    </svg>
  );
}

export function IconCar({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.8 8.5h10.4l1.6 4H5.2l1.6-4zm-2.1 4.5h14.6v4.5a1.5 1.5 0 01-1.5 1.5h-1.25a1.75 1.75 0 01-3.4 0H10.85a1.75 1.75 0 01-3.4 0H6.2A1.5 1.5 0 014.7 17V13zm3.05 5.25a.75.75 0 100-1.5.75.75 0 000 1.5zm8.4 0a.75.75 0 100-1.5.75.75 0 000 1.5zM7.5 7A1.5 1.5 0 019 5.5h6A1.5 1.5 0 0116.5 7v1H7.5V7z" />
    </svg>
  );
}

export function IconShirt({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.2 3.5h5.6l1.8 2.2 3.2-1.2 1.5 3.2-3.8 1.8V20a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017.5 20V9.5L3.7 7.7 5.2 4.5l3.2 1.2 1.8-2.2zm1.1 1.5l-1.3 1.6-2.4-.9-.5 1.1 3.4 1.6v11.1h6v-11.1l3.4-1.6-.5-1.1-2.4.9-1.3-1.6h-3.4z" />
    </svg>
  );
}

export function IconBall({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17zm0 1.5a7 7 0 00-6.85 5.5h3.12c.3-1.55.9-2.95 1.75-4.05A7 7 0 0012 5zm2.98 1.45c.85 1.1 1.45 2.5 1.75 4.05h3.12A7 7 0 0014.98 6.45zM5.15 13.5A7 7 0 0012 19a7 7 0 006.85-5.5h-3.12c-.3 1.55-.9 2.95-1.75 4.05A7 7 0 0112 17a7 7 0 01-1.98-.45c-.85-1.1-1.45-2.5-1.75-4.05H5.15zM9.8 12h4.4c-.25-1.35-.7-2.55-1.3-3.4-.35-.5-.75-.85-1.1-.85s-.75.35-1.1.85c-.6.85-1.05 2.05-1.3 3.4z" />
    </svg>
  );
}

export function IconPlant({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 13.5c3.5 0 6.5-2.2 6.5-5.5S15 4.5 12 4.5c0 2.4-1.2 4.5-3 5.7 1.2 1.4 2.9 2.3 4.8 2.3 0 .3 0 .7-.1 1H7.5A1.5 1.5 0 006 15v1.5h12V15a1.5 1.5 0 00-1.5-1.5H12.1c.2-.5.3-1 .3-1.5 1.7-.2 3.2-1 4.3-2.2-1.4 1.4-3.4 2.2-5.6 2.2h.9zM11.25 16.5h1.5V20h-1.5v-3.5z" />
    </svg>
  );
}

export function IconBox({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.2l8 4.2v9.2l-8 4.2-8-4.2V7.4l8-4.2zm0 1.7L6.2 8 12 11.1 17.8 8 12 4.9zm-6.5 4.7v6.7l5.75 3V13L5.5 9.6zm7.25 9.7l5.75-3V9.6L12.75 13v6.3z" />
    </svg>
  );
}

export function IconPin({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5a6 6 0 016 6c0 4.2-4.4 9.4-5.6 10.8a.75.75 0 01-1.15 0C10.05 17.9 6 12.7 6 8.5a6 6 0 016-6zm0 1.5a4.5 4.5 0 00-4.5 4.5c0 2.9 2.8 6.9 4.5 9 1.7-2.1 4.5-6.1 4.5-9A4.5 4.5 0 0012 4zm0 2.5a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  );
}

const CATEGORY_ICON_MAP: Record<
  CategoryIconKey,
  (props: IconProps) => ReactElement
> = {
  sparkles: IconSparkles,
  clipboard: IconClipboard,
  briefcase: IconProfessional,
  bag: IconBag,
  wrench: IconWrench,
  crane: IconCrane,
  broom: IconBroom,
  monitor: IconMonitor,
  book: IconBook,
  party: IconParty,
  phone: IconPhone,
  sofa: IconSofa,
  car: IconCar,
  shirt: IconShirt,
  ball: IconBall,
  plant: IconPlant,
  box: IconBox,
  pin: IconPin,
};

export function CategoryIcon({
  name,
  className = "h-6 w-6",
}: {
  name: CategoryIconKey;
  className?: string;
}) {
  const Icon = CATEGORY_ICON_MAP[name] ?? IconPin;
  return <Icon className={className} />;
}
