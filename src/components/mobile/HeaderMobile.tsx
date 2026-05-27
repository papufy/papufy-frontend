import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProfilePhotoUrl } from "../../lib/profilePhoto";
import { NotificationsMenu } from "../NotificationsMenu";
import { PapufyLogo } from "../PapufyLogo";
import { IconSearch, IconUser } from "../icons/NavIcons";

const GUEST_CTA_LABELS = ["Anunciar grátis", "Encontrar Serviço"] as const;
const CTA_ROTATE_MS = 4000;
/** Largura fixa para os dois textos do CTA não cortarem em telas estreitas. */
const GUEST_CTA_CLASS =
  "header-cta-guest relative flex h-9 w-[5.85rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-2 text-[10px] font-bold leading-[1.15] text-white shadow-md shadow-sky-200/60 transition active:scale-95";

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
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [ctaIndex, setCtaIndex] = useState(0);
  const profilePhoto = getProfilePhotoUrl(user?.id);

  const firstName = displayFirstName(user?.nome);

  useEffect(() => {
    if (isAuthenticated) return;
    const id = window.setInterval(() => {
      setCtaIndex((i) => (i + 1) % GUEST_CTA_LABELS.length);
    }, CTA_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated]);

  const guestCtaLabel = GUEST_CTA_LABELS[ctaIndex];

  const handleGuestCta = () => {
    if (guestCtaLabel === "Anunciar grátis") {
      navigate("/entrar", { state: { redirect: "/anunciar/tipo" } });
      return;
    }
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white shadow-sm">
      <div className="flex h-[3.75rem] w-full items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center py-1 active:opacity-85"
          aria-label="Papufy — início"
        >
          <PapufyLogo className="h-10 w-auto max-w-[10.5rem] object-contain object-left drop-shadow-[0_2px_8px_rgba(14,116,144,0.18)] sm:h-11 sm:max-w-[12rem]" />
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {pathname.startsWith("/entrar") ? null : (
            <button
              type="button"
              onClick={() => navigate("/buscar")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-slate-50"
              aria-label="Abrir busca"
            >
              <IconSearch className="h-5 w-5 text-sky-600" />
            </button>
          )}
          {isAuthenticated && <NotificationsMenu variant="mobile" />}

          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="flex max-w-[7.5rem] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/50 py-1 pl-1 pr-2 transition active:scale-[0.98] active:bg-slate-100 sm:max-w-[8.5rem] sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-2.5"
              aria-label="Abrir perfil"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500 sm:h-8 sm:w-8">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <IconUser className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </span>
              <span className="truncate text-[11px] font-medium text-slate-700 sm:text-xs">
                {firstName}
              </span>
              <IconChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </Link>
          ) : (
            <>
              <Link
                to="/entrar"
                className="shrink-0 rounded-full border border-sky-500 bg-white px-3 py-2 text-[11px] font-bold text-sky-600 transition active:scale-95 sm:text-sm"
              >
                Entrar
              </Link>
              <button
                type="button"
                onClick={handleGuestCta}
                className={GUEST_CTA_CLASS}
                aria-label={guestCtaLabel}
              >
                <span
                  key={guestCtaLabel}
                  className="header-cta-fade block max-w-full text-center whitespace-normal"
                >
                  {guestCtaLabel}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
