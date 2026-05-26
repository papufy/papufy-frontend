import type { ReactNode } from "react";
import { MobileShell } from "./mobile/MobileShell";

interface LayoutProps {
  children: ReactNode;
  onRefreshJobs?: () => void;
  showCategories?: boolean;
}

/** Wrapper legado — delega ao shell mobile-first. */
export function Layout({
  children,
  onRefreshJobs,
  showCategories = false,
}: LayoutProps) {
  return (
    <MobileShell
      onRefreshListings={onRefreshJobs}
      showCategories={showCategories}
    >
      {children}
    </MobileShell>
  );
}
