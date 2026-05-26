import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { CategoryScroll } from "./CategoryScroll";
import { HeaderMobile } from "./HeaderMobile";
import { SearchBar } from "./SearchBar";

interface MobileShellProps {
  children: ReactNode;
  onRefreshListings?: () => void;
  showCategories?: boolean;
  showSearch?: boolean;
}

const HIDE_BOTTOM = ["/entrar"];
const HIDE_SEARCH = ["/buscar", "/entrar"];

export function MobileShell({
  children,
  onRefreshListings,
  showCategories = false,
  showSearch = true,
}: MobileShellProps) {
  const { pathname } = useLocation();
  const hideBottom = HIDE_BOTTOM.some((p) => pathname.startsWith(p));
  const hideSearch = HIDE_SEARCH.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-[100dvh] bg-papufy-bg">
      <HeaderMobile />

      {showSearch && !hideSearch && (
        <div className="bg-white pb-4">
          <SearchBar onSearch={onRefreshListings} />
        </div>
      )}

      {showCategories && (
        <div className="bg-white pb-5">
          <CategoryScroll onChange={onRefreshListings} />
        </div>
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
