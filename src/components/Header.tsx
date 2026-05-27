import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useToast } from "../context/ToastContext";
import { IconBell, IconChat, IconPlus } from "./icons/NavIcons";
import { HeaderNavItem } from "./HeaderNavItem";
import { PapufyLogo } from "./PapufyLogo";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onSearch?: () => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useChat();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAnunciar = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/anunciar" } });
      return;
    }
    navigate("/anunciar");
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      showToast(
        "Abra um serviço e toque em «Chat» para falar com o anunciante.",
        "info"
      );
      navigate("/");
      return;
    }
    navigate("/chat");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-papufy-border bg-white shadow-sm">
      <div className="page-container flex items-center gap-2 py-2.5 sm:gap-3 lg:gap-4">
        <Link to="/" className="shrink-0" aria-label="Papufy — início">
          <PapufyLogo className="h-8 w-auto max-w-[10rem] object-contain sm:h-9" />
        </Link>

        <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
          <SearchBar onSearch={onSearch} variant="header" />
        </div>

        {isAuthenticated && (
          <nav className="hidden shrink-0 items-center gap-0.5 lg:flex">
            <HeaderNavItem
              icon={<IconChat />}
              label="Chat"
              onClick={handleChat}
              badge={unreadCount}
            />
            <HeaderNavItem
              icon={<IconBell />}
              label="Notificações"
              onClick={() => navigate("/notificacoes")}
            />
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {isAuthenticated ? (
            <div className="hidden lg:block">
              <UserMenu variant="header" />
            </div>
          ) : (
            <Link
              to="/entrar"
              className="touch-target hidden rounded-lg px-2 text-sm font-semibold text-papufy-text hover:text-papufy-orange lg:inline-flex lg:items-center"
            >
              Entrar
            </Link>
          )}

          <button
            type="button"
            onClick={handleAnunciar}
            className="touch-target hidden shrink-0 items-center gap-2 rounded-full bg-papufy-orange px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-papufy-orange-dark lg:flex"
          >
            <IconPlus className="h-4 w-4" />
            Anunciar grátis
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/notificacoes")}
              className="touch-target rounded-full p-2 text-papufy-muted hover:bg-gray-50 lg:hidden"
              aria-label="Notificações"
            >
              <IconBell className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="page-container border-t border-papufy-border py-2 lg:hidden">
        <SearchBar onSearch={onSearch} variant="header" />
      </div>
    </header>
  );
}
