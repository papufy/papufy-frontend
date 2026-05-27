import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfilePhotoUrl } from "../lib/profilePhoto";
import { IconChevronDown, IconUser } from "./icons/NavIcons";

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

  const displayName = user.nome.split(" ")[0];
  const profilePhoto = getProfilePhotoUrl(user.id);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "compact"
            ? "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1"
            : "flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-gray-50"
        }
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <IconUser className="h-5 w-5" />
          )}
        </span>
        {variant === "header" && (
          <>
            <span className="max-w-[74px] truncate text-xs font-medium text-papufy-text">
              {displayName}
            </span>
            <IconChevronDown className="h-3.5 w-3.5 text-papufy-muted" />
          </>
        )}
        {variant === "compact" && (
          <span className="max-w-[64px] truncate text-[11px] text-papufy-muted">
            {displayName}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-papufy-border bg-white py-1 shadow-xl">
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
          <Link
            to="/carteira"
            className="block px-4 py-2.5 text-sm hover:bg-sky-50"
            onClick={() => setOpen(false)}
          >
            Carteira
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
