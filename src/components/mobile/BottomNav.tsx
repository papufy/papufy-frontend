import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
  IconChat,
  IconHome,
  IconPlus,
  IconSearch,
  IconUser,
} from "../icons/NavIcons";

const HIDDEN = ["/entrar"];

export function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;

  const isActive = (path: string) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);

  const itemClass = (active: boolean) =>
    `touch-target flex min-w-0 flex-1 flex-col items-center justify-end gap-0.5 select-none px-0.5 pb-0.5 text-[10px] font-semibold leading-tight transition active:scale-95 ${
      active ? "text-sky-500" : "text-papufy-muted"
    }`;

  const handleAnunciar = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/anunciar/tipo" } });
      return;
    }
    navigate("/anunciar/tipo");
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/chat" } });
      return;
    }
    navigate("/chat");
  };

  const handleProfile = () => {
    if (!isAuthenticated) {
      navigate("/entrar");
      return;
    }
    navigate("/perfil");
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-papufy-border bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md"
      aria-label="Menu principal"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-end justify-between px-1 pt-2">
        <Link to="/" className={itemClass(isActive("/"))}>
          <IconHome className="h-6 w-6" />
          <span>Início</span>
        </Link>

        <Link
          to="/buscar"
          className={itemClass(isActive("/buscar"))}
          aria-label="Buscar"
        >
          <IconSearch className="h-6 w-6" />
          <span>Buscar</span>
        </Link>

        <div className="flex w-14 shrink-0 flex-col items-center justify-end self-stretch">
          <button
            type="button"
            onClick={handleAnunciar}
            className="touch-target -mt-3 flex flex-col items-center gap-0.5 active:scale-95"
            aria-label="Anunciar"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-200/50 ring-4 ring-white">
              <IconPlus className="h-6 w-6" />
            </span>
            <span className="text-[10px] font-bold leading-none text-sky-600">
              Anunciar
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleChat}
          className={`${itemClass(isActive("/chat"))} relative`}
          aria-label={
            unreadCount > 0
              ? `Chat, ${unreadCount} mensagens não lidas`
              : "Chat"
          }
        >
          <IconChat className="h-6 w-6" />
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={handleProfile}
          className={itemClass(isActive("/perfil"))}
          aria-label="Perfil"
        >
          <IconUser className="h-6 w-6" />
          <span>Perfil</span>
        </button>
      </div>
    </nav>
  );
}
