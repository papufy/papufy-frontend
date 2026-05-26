import { AppPageHome } from "../components/home/AppPageHome";
import { MobileShell } from "../components/mobile/MobileShell";

export function HomePage() {
  return (
    <MobileShell showCategories>
      <AppPageHome />
    </MobileShell>
  );
}
