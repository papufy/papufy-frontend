import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { IconChat } from "../icons/NavIcons";

function IconChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function displayFirstName(fullName: string | undefined): string {
  if (!fullName?.trim()) return "Conta";
  const first = fullName.trim().split(/\s+/)[0];
  return first.length > 14 ? `${first.slice(0, 12)}…` : first;
}

export function HeaderMobile() {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const firstName = displayFirstName(user?.nome);
  const initial = user?.nome?.charAt(0).toUpperCase() ?? "?";

  const openChat = () => {
    if (isAuthenticated) {
      navigate("/chat");
      return;
    }
    navigate("/entrar", { state: { redirect: "/chat" } });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="flex h-16 w-full items-center justify-between px-4">
        <Link
          to="/"
          className="shrink-0 active:opacity-80"
          aria-label="Papufy — início"
        >
          <span className="font-display text-xl font-bold tracking-tight text-sky-500">
            Papufy
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openChat}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-slate-50"
            aria-label={
              unreadCount > 0
                ? `Chat, ${unreadCount} mensagens não lidas`
                : "Chat"
            }
          >
            <IconChat className="h-6 w-6" />
            {isAuthenticated && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="flex max-w-[9.5rem] items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 py-1.5 pl-1.5 pr-3 transition active:scale-[0.98] active:bg-slate-100"
              aria-label="Abrir perfil"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">
                {initial}
              </span>
              <span className="truncate text-sm font-semibold text-slate-800">
                {firstName}
              </span>
              <IconChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ) : (
            <Link
              to="/entrar"
              className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition active:scale-95"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
