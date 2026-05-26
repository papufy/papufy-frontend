import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
  IconBell,
  IconGrid,
  IconHome,
  IconPlus,
  IconUser,
} from "../icons/NavIcons";
import { MenuSearchBar } from "./MenuSearchBar";

const HIDDEN = ["/entrar"];

/** Altura da faixa de ícones (sem a barra de busca). */
const NAV_ICONS_HEIGHT = "4.75rem";

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
    `touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 select-none px-0.5 py-1 text-[10px] font-semibold leading-tight transition active:scale-95 ${
      active ? "text-sky-500" : "text-papufy-muted"
    }`;

  const handleAnunciar = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/anunciar/tipo" } });
      return;
    }
    navigate("/anunciar/tipo");
  };

  const handleNotifications = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/notificacoes" } });
      return;
    }
    navigate("/notificacoes");
  };

  const handleMyAds = () => {
    if (!isAuthenticated) {
      navigate("/entrar", { state: { redirect: "/minhas-publicacoes" } });
      return;
    }
    navigate("/minhas-publicacoes");
  };

  const handleProfile = () => {
    if (!isAuthenticated) {
      navigate("/entrar");
      return;
    }
    navigate("/perfil");
  };

  const searchBottom = `calc(${NAV_ICONS_HEIGHT} + env(safe-area-inset-bottom, 0px))`;

  return (
    <>
      {/* Barra de busca fixa, sempre acima dos ícones do menu */}
      <div
        className="fixed inset-x-0 z-[60] border-t border-slate-200/80 bg-white px-3 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
        style={{ bottom: searchBottom }}
      >
        <div className="mx-auto w-full max-w-lg">
          <MenuSearchBar compact />
        </div>
      </div>

      {/* Ícones do menu inferior */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[55] border-t border-papufy-border bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ height: `calc(${NAV_ICONS_HEIGHT} + env(safe-area-inset-bottom, 0px))` }}
        aria-label="Menu principal"
      >
        <div className="mx-auto flex h-[4.75rem] max-w-lg items-end justify-around px-1 pt-1">
          <Link to="/" className={itemClass(isActive("/"))}>
            <IconHome className="h-6 w-6" />
            <span>Início</span>
          </Link>

          <button
            type="button"
            onClick={handleNotifications}
            className={`${itemClass(isActive("/notificacoes"))} relative`}
            aria-label={
              unreadCount > 0
                ? `Notificações, ${unreadCount} não lidas`
                : "Notificações"
            }
          >
            <IconBell className="h-6 w-6" />
            {isAuthenticated && unreadCount > 0 && (
              <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span>Notificações</span>
          </button>

          <button
            type="button"
            onClick={handleAnunciar}
            className="touch-target -mt-5 flex flex-col items-center gap-0.5 px-1 active:scale-95"
            aria-label="Anunciar"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-200/60 ring-4 ring-white">
              <IconPlus className="h-7 w-7" />
            </span>
            <span className="text-[10px] font-bold text-sky-600">Anunciar</span>
          </button>

          <button
            type="button"
            onClick={handleMyAds}
            className={itemClass(isActive("/minhas-publicacoes"))}
            aria-label="Meus anúncios"
          >
            <IconGrid className="h-6 w-6" />
            <span>Anúncios</span>
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
    </>
  );
}
