import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconChevronDown } from "./icons/NavIcons";

interface UserMenuProps {
  variant?: "header" | "compact";
}

export function UserMenu({ variant = "header" }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initial = user.nome.charAt(0).toUpperCase();
  const displayName = user.nome.split(" ")[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "compact"
            ? "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1"
            : "flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-gray-50"
        }
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-papufy-orange text-sm font-bold text-white">
          {initial}
        </span>
        {variant === "header" && (
          <>
            <span className="max-w-[90px] truncate text-sm font-medium text-papufy-text">
              {displayName}
            </span>
            <IconChevronDown className="text-papufy-muted" />
          </>
        )}
        {variant === "compact" && (
          <span className="max-w-[64px] truncate text-[11px] text-papufy-muted">
            {displayName}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-papufy-border bg-white py-1 shadow-xl">
          <Link
            to="/minhas-publicacoes"
            className="block px-4 py-2.5 text-sm hover:bg-sky-50"
            onClick={() => setOpen(false)}
          >
            Meus Anúncios
          </Link>
          <Link
            to="/perfil"
            className="block px-4 py-2.5 text-sm hover:bg-sky-50"
            onClick={() => setOpen(false)}
          >
            Meu perfil
          </Link>
          <Link
            to="/chat"
            className="block px-4 py-2.5 text-sm hover:bg-sky-50"
            onClick={() => setOpen(false)}
          >
            Chat
          </Link>
          <hr className="my-1 border-papufy-border" />
          <button
            type="button"
            className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/");
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
