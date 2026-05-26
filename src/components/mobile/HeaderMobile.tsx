import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { PapufyLogo } from "../PapufyLogo";
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
          className="group flex min-w-0 shrink-0 items-center py-1 pr-2 active:scale-[0.98]"
          aria-label="Papufy — início"
        >
          <PapufyLogo className="h-8 w-auto max-w-[9.5rem] object-contain object-left sm:h-9 sm:max-w-[10.5rem]" />
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
