import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { IconChat } from "../icons/NavIcons";

export function HeaderMobile() {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const initial = user?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/95 shadow-sm shadow-sky-100/40 backdrop-blur-md">
      <div className="mobile-gutter flex h-[3.25rem] items-center justify-between gap-3 sm:h-14">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-1.5 py-1 pr-2 active:scale-[0.98]"
          aria-label="Papufy — início"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-black text-white shadow-md shadow-sky-200/60"
            aria-hidden
          >
            P
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 bg-clip-text font-display text-[1.35rem] font-extrabold tracking-tight text-transparent sm:text-2xl">
              Papufy
            </span>
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-500/80 sm:block">
              Serviços perto de você
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="touch-target relative rounded-full p-2 text-slate-500 transition active:scale-95 active:bg-sky-50"
              aria-label="Chat"
            >
              <IconChat className="h-6 w-6 text-sky-600" />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              isAuthenticated ? navigate("/perfil") : navigate("/entrar")
            }
            className="touch-target ml-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-sky-500 text-sm font-bold text-white shadow-md ring-2 ring-white active:scale-95"
            aria-label="Perfil"
          >
            {initial}
          </button>
        </div>
      </div>
    </header>
  );
}
