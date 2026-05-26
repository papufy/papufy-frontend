import type { ReactNode } from "react";

interface HeaderNavItemProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  badge?: number;
}

export function HeaderNavItem({
  icon,
  label,
  onClick,
  badge,
}: HeaderNavItemProps) {
  const content = (
    <>
      <span className="relative flex h-7 w-7 items-center justify-center text-papufy-muted">
        {icon}
        {badge != null && badge > 0 && (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-papufy-orange px-1 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="max-w-[72px] truncate text-center text-[11px] leading-tight text-papufy-muted">
        {label}
      </span>
    </>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="touch-target flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 transition hover:bg-gray-50 hover:text-papufy-orange"
    >
      {content}
    </button>
  );
}
