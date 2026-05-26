import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_META } from "../../constants/categories";
import type { Listing } from "../../types";
import { formatLocation, formatPrice } from "../../utils/format";
import { IconHeart } from "../icons/NavIcons";

interface ListingCardMobileProps {
  listing: Listing;
}

export function ListingCardMobile({ listing }: ListingCardMobileProps) {
  const [favorited, setFavorited] = useState(false);
  const meta = CATEGORY_META[listing.categoria] ?? CATEGORY_META.Outros;
  const isJobVacancy = listing.listingType === "JOB_VACANCY";
  const cover = listing.imagemCapa;
  const showImage = cover && !cover.includes("placeholders/");

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited((v) => !v);
  };

  return (
    <Link
      to={`/anuncio/${listing.id}`}
      className="group flex select-none flex-col overflow-hidden rounded-xl border border-papufy-border bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        {showImage ? (
          <img
            src={cover}
            alt={listing.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${meta.imageGradient} ${
            showImage ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="text-5xl drop-shadow-lg">{meta.icon}</span>
        </div>

        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm ${
            isJobVacancy
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {isJobVacancy ? "PEDIDO DE SERVIÇO" : "PROFISSIONAL DISPONÍVEL"}
        </span>

        <button
          type="button"
          onClick={toggleFavorite}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition active:scale-90 ${
            favorited ? "text-papufy-orange" : "text-papufy-muted"
          }`}
          aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
        >
          <IconHeart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-papufy-text">
          {listing.titulo}
        </h3>
        <p className="text-base font-extrabold text-papufy-text">
          {formatPrice(listing.preco ?? null, listing.aCombinar)}
        </p>
        <p className="line-clamp-1 text-[10px] text-papufy-muted">
          {formatLocation(listing.cidade, listing.uf, listing.bairro)}
        </p>
      </div>
    </Link>
  );
}
