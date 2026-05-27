import { useCallback, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_META } from "../../constants/categories";
import type { Listing } from "../../types";
import { formatPrice, formatRelativeTime } from "../../utils/format";
import { IconHeart } from "../icons/NavIcons";

const FAVORITES_KEY = "papufy_favorites";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(ids: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
}

interface ListingCardMobileProps {
  listing: Listing;
  /** Grid “Serviços em Destaque” e listagem compacta na home */
  compact?: boolean;
}

export function ListingCardMobile({
  listing,
  compact = false,
}: ListingCardMobileProps) {
  const meta = CATEGORY_META[listing.categoria] ?? CATEGORY_META.Outros;
  const isBico =
    listing.listingType === "JOB_VACANCY";
  const cover = listing.imagemCapa;
  const showImage = Boolean(cover && !cover.includes("placeholders/"));

  const [favorited, setFavorited] = useState(() =>
    loadFavorites().has(listing.id)
  );

  const toggleFavorite = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = loadFavorites();
      if (next.has(listing.id)) next.delete(listing.id);
      else next.add(listing.id);
      saveFavorites(next);
      setFavorited(next.has(listing.id));
    },
    [listing.id]
  );

  const locationShort = `${listing.cidade}, ${listing.uf}`;
  const timeLabel = formatRelativeTime(listing.createdAt);

  return (
    <Link
      to={`/anuncio/${listing.id}`}
      className={`group flex select-none flex-col overflow-hidden border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98] active:shadow-none ${
        compact ? "rounded-lg" : "rounded-xl"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-slate-100 ${
          compact ? "aspect-square" : "aspect-[4/5]"
        }`}
      >
        {showImage ? (
          <img
            src={cover!}
            alt={listing.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(145deg,#f1f5f9_0%,#e2e8f0_50%,#f8fafc_100%)]"
            aria-hidden
          >
            <span
              className={`opacity-90 drop-shadow-sm ${compact ? "text-2xl" : "text-4xl"}`}
            >
              {meta.icon}
            </span>
            <span
              className={`mt-1 font-semibold uppercase tracking-wide text-slate-400 ${
                compact ? "text-[8px]" : "mt-2 text-[10px]"
              }`}
            >
              {listing.categoria}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition active:scale-90 ${
            compact ? "h-6 w-6" : "right-2 top-2 h-9 w-9"
          }`}
          aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
        >
          <IconHeart
            className={`transition ${compact ? "h-3.5 w-3.5" : "h-5 w-5"} ${
              favorited
                ? "fill-sky-500 stroke-sky-500"
                : "stroke-slate-500 fill-transparent"
            }`}
          />
        </button>

        <span
          className={`absolute max-w-[calc(100%-2.5rem)] rounded-md font-bold uppercase leading-tight tracking-wide shadow-sm ${
            compact
              ? "bottom-1 left-1 px-1 py-0.5 text-[7px]"
              : "bottom-2 left-2 rounded-lg px-2 py-1 text-[9px]"
          } ${
            isBico
              ? "bg-emerald-100/95 text-emerald-800"
              : "bg-sky-100/95 text-sky-800"
          }`}
        >
          {isBico ? "[Pedido de serviço]" : "[Profissional disponível]"}
        </span>
      </div>

      <div
        className={`flex flex-1 flex-col gap-0.5 ${compact ? "p-1.5" : "gap-1 p-2.5"}`}
      >
        <h3
          className={`line-clamp-2 font-bold leading-snug text-slate-800 ${
            compact
              ? "text-[10px] leading-tight"
              : "min-h-[2.5rem] text-xs"
          }`}
        >
          {listing.titulo}
        </h3>
        <p
          className={`font-extrabold text-sky-700 ${
            compact ? "text-[11px] leading-none" : "text-sm"
          }`}
        >
          {formatPrice(listing.preco ?? null, listing.aCombinar)}
        </p>
        <p
          className={`line-clamp-1 text-slate-500 ${
            compact ? "text-[8px]" : "text-[10px]"
          }`}
        >
          {locationShort} · {timeLabel}
        </p>
      </div>
    </Link>
  );
}
