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
    <header className="sticky top-0 z-50 border-b border-papufy-border bg-white shadow-sm">
      <div className="page-container flex h-14 items-center justify-between gap-3">
        <Link
          to="/"
          className="flex shrink-0 items-center active:scale-[0.98]"
          aria-label="Papufy — início"
        >
          <img
            src="/nome.png"
            alt="Papufy"
            className="h-8 w-auto max-w-[120px] object-contain object-left"
          />
        </Link>

        <div className="flex items-center gap-0.5">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="touch-target relative rounded-full p-2 text-papufy-muted transition active:scale-95 active:bg-gray-100"
              aria-label="Chat"
            >
              <IconChat className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-papufy-orange px-1 text-[9px] font-bold text-white">
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
            className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-papufy-purple to-papufy-purple-deep text-sm font-bold text-white shadow-sm active:scale-95"
            aria-label="Perfil"
          >
            {initial}
          </button>
        </div>
      </div>
    </header>
  );
}
