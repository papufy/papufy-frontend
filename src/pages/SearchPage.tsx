import { MobileShell } from "../components/mobile/MobileShell";
import { SearchBar } from "../components/mobile/SearchBar";

export function SearchPage() {
  return (
    <MobileShell showSearch={false}>
      <SearchBar autoFocusFullscreen />
      <div className="page-container py-8 text-center text-sm text-papufy-muted">
        <p>Digite o que procura e toque em buscar.</p>
        <p className="mt-2">Sua busca abrirá a home com os resultados.</p>
      </div>
    </MobileShell>
  );
}
