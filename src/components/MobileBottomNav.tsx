import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useToast } from "../context/ToastContext";
import { IconChat, IconGrid, IconHome, IconPlus, IconUser } from "./icons/NavIcons";

const HIDDEN_PREFIXES = ["/entrar"];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useChat();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

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

  const handleAnunciar = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/anunciar" } });
      return;
    }
    navigate("/anunciar");
  };

  const isActive = (path: string) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);

  const navBtnClass = (active: boolean) =>
    `touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium leading-tight transition ${
      active ? "text-papufy-orange" : "text-papufy-muted"
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-papufy-border bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        <Link to="/" className={navBtnClass(isActive("/"))}>
          <IconHome className="h-6 w-6" />
          <span>Início</span>
        </Link>

        <button
          type="button"
          onClick={() =>
            isAuthenticated
              ? navigate("/minhas-publicacoes")
              : navigate("/entrar", {
                  state: { redirect: "/minhas-publicacoes" },
                })
          }
          className={navBtnClass(isActive("/minhas-publicacoes"))}
        >
          <IconGrid className="h-6 w-6" />
          <span>Anúncios</span>
        </button>

        <button
          type="button"
          onClick={handleAnunciar}
          className="touch-target -mt-5 flex flex-col items-center justify-center gap-0.5 px-2"
          aria-label="Anunciar grátis"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-papufy-orange text-white shadow-md ring-4 ring-[#f5f5f5]">
            <IconPlus className="h-6 w-6" />
          </span>
          <span className="text-[10px] font-bold text-papufy-orange">
            Anunciar
          </span>
        </button>

        <button
          type="button"
          onClick={handleChat}
          className={`${navBtnClass(isActive("/chat"))} relative`}
        >
          <span className="relative">
            <IconChat className="h-6 w-6" />
            {isAuthenticated && unreadCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-papufy-orange px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span>Chat</span>
        </button>

        {isAuthenticated ? (
          <Link to="/perfil" className={navBtnClass(isActive("/perfil"))}>
            <IconUser className="h-6 w-6" />
            <span>Perfil</span>
          </Link>
        ) : (
          <Link to="/entrar" className={navBtnClass(pathname === "/entrar")}>
            <IconUser className="h-6 w-6" />
            <span>Entrar</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
