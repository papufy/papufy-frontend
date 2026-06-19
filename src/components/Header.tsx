import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useToast } from "../context/ToastContext";
import { Button } from "@/components/ui/button";
import { IconChat, IconPlus } from "./icons/NavIcons";
import { HeaderNavItem } from "./HeaderNavItem";
import { NotificationsMenu } from "./NotificationsMenu";
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
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="page-container flex items-center gap-2 py-3 sm:gap-3 lg:gap-4">
        <Link to="/" className="shrink-0 py-0.5" aria-label="Papufy — início">
          <PapufyLogo className="h-10 w-auto max-w-[12rem] object-contain drop-shadow-[0_2px_8px_rgba(14,116,144,0.15)] sm:h-12 sm:max-w-[14rem]" />
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
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {isAuthenticated && <NotificationsMenu variant="desktop" />}
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

          <Button
            type="button"
            variant="papufy"
            size="pill"
            onClick={handleAnunciar}
            className="hidden shrink-0 gap-2 lg:inline-flex"
          >
            <IconPlus className="h-4 w-4" />
            Anunciar grátis
          </Button>

          {isAuthenticated && <NotificationsMenu variant="mobile" />}
        </div>
      </div>

      <div className="page-container border-t border-papufy-border py-2 lg:hidden">
        <SearchBar onSearch={onSearch} variant="header" />
      </div>
    </header>
  );
}
