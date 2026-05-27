import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BottomNav } from "./BottomNav";
import { CategoryScroll } from "./CategoryScroll";
import { HeaderMobile } from "./HeaderMobile";
import { Header as DesktopHeader } from "../Header";
import { CategoryBar } from "../CategoryBar";

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
  const { isAuthenticated } = useAuth();
  const hideBottom =
    HIDE_BOTTOM.some((p) => pathname.startsWith(p)) || !isAuthenticated;

  return (
    <div className="min-h-[100dvh] bg-papufy-bg">
      <div className="lg:hidden">
        <HeaderMobile />
        {showCategories && (
          <CategoryScroll onChange={onRefreshListings} />
        )}
      </div>

      <div className="hidden lg:block">
        <DesktopHeader />
        {showCategories && (
          <CategoryBar onCategorySelect={onRefreshListings} />
        )}
      </div>

      <main
        className={
          hideBottom
            ? ""
            : "pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
        }
      >
        {children}
      </main>
      {!hideBottom && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
