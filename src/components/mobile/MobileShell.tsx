import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { CategoryScroll } from "./CategoryScroll";
import { HeaderMobile } from "./HeaderMobile";

interface MobileShellProps {
  children: ReactNode;
  onRefreshListings?: () => void;
  showCategories?: boolean;
}

const HIDE_BOTTOM = ["/entrar"];

export function MobileShell({
  children,
  onRefreshListings,
  showCategories = false,
}: MobileShellProps) {
  const { pathname } = useLocation();
  const hideBottom = HIDE_BOTTOM.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-[100dvh] bg-papufy-bg">
      <HeaderMobile />
      {showCategories && (
        <CategoryScroll onChange={onRefreshListings} />
      )}
      <main
        className={
          hideBottom
            ? ""
            : "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]"
        }
      >
        {children}
      </main>
      {!hideBottom && <BottomNav />}
    </div>
  );
}
