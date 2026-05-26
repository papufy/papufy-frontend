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
    `touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 select-none px-1 py-1 text-[10px] font-semibold transition active:scale-95 ${
      active ? "text-papufy-orange" : "text-papufy-muted"
    }`;

  const handleAnunciar = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/anunciar/tipo" } });
      return;
    }
    navigate("/anunciar/tipo");
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-papufy-border bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Menu principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-1 pt-1">
        <Link to="/" className={itemClass(isActive("/"))}>
          <IconHome className="h-6 w-6" />
          <span>Home</span>
        </Link>

        <Link
          to="/buscar"
          className={itemClass(isActive("/buscar"))}
          aria-label="Abrir busca"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
            <IconSearch className="h-5 w-5" />
          </span>
          <span>Buscar</span>
        </Link>

        <button
          type="button"
          onClick={handleAnunciar}
          className="touch-target -mt-5 flex flex-col items-center gap-0.5 px-2 active:scale-95"
          aria-label="Anunciar"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-papufy-orange text-white shadow-lg ring-4 ring-[#f5f5f5]">
            <IconPlus className="h-7 w-7" />
          </span>
          <span className="text-[10px] font-bold text-papufy-orange">
            Anunciar
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            isAuthenticated ? navigate("/chat") : navigate("/entrar")
          }
          className={`${itemClass(isActive("/chat"))} relative`}
        >
          <IconChat className="h-6 w-6" />
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-papufy-orange px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() =>
            isAuthenticated ? navigate("/perfil") : navigate("/entrar")
          }
          className={itemClass(isActive("/perfil"))}
        >
          <IconUser className="h-6 w-6" />
          <span>Perfil</span>
        </button>
      </div>
    </nav>
  );
}
