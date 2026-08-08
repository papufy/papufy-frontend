import { useCallback, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCategoryMeta } from "../../constants/categories";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import type { Listing } from "../../types";
import { formatListingPrice, formatRelativeTime } from "../../utils/format";
import { AnimatedLordIcon, useLordPlay } from "../icons/AnimatedLordIcon";
import { MotionPressButton } from "../motion/MotionPrimitives";

interface ListingCardMobileProps {
  listing: Listing;
  /** Grid “Serviços em Destaque” e listagem compacta na home */
  compact?: boolean;
}

export function ListingCardMobile({
  listing,
  compact = false,
}: ListingCardMobileProps) {
  const meta = getCategoryMeta(listing.categoria);
  const isBico = listing.listingType === "JOB_VACANCY";
  const cover = listing.imagemCapa;
  const showImage = Boolean(cover && !cover.includes("placeholders/"));
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const favorited = isFavorite(listing.id);
  const { playToken: heartPlay, trigger: triggerHeart } = useLordPlay();

  const handleFavorite = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHeart();
      if (!isAuthenticated) {
        navigate("/entrar", { state: { redirect: "/" } });
        return;
      }
      void toggleFavorite(listing.id);
    },
    [isAuthenticated, listing.id, navigate, toggleFavorite, triggerHeart]
  );

  const locationShort = `${listing.cidade}, ${listing.uf}`;
  const timeLabel = formatRelativeTime(listing.createdAt);

  return (
    <Link
      to={`/anuncio/${listing.id}`}
      className="group block select-none active:scale-[0.98]"
    >
      <Card
        size="sm"
        className={`gap-0 overflow-hidden py-0 ring-border/70 transition-shadow hover:shadow-md group-active:shadow-none ${
          compact ? "rounded-lg" : "rounded-xl"
        }`}
      >
        <div
          className={`relative w-full overflow-hidden bg-muted ${
            compact ? "aspect-square" : "aspect-[4/5]"
          }`}
        >
          {showImage ? (
            <img
              src={cover!}
              alt={listing.titulo}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
                className={`mt-1 font-semibold uppercase tracking-wide text-muted-foreground ${
                  compact ? "text-[8px]" : "mt-2 text-[10px]"
                }`}
              >
                {listing.categoria}
              </span>
            </div>
          )}

          <MotionPressButton
            onClick={handleFavorite}
            className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full bg-card/95 shadow-md backdrop-blur-sm ${
              compact ? "h-7 w-7" : "right-2 top-2 h-9 w-9"
            }`}
            aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
          >
            <AnimatedLordIcon
              name="heart"
              size={compact ? 18 : 22}
              scale={1}
              playToken={heartPlay}
              className={favorited ? "opacity-100" : "opacity-80"}
            />
          </MotionPressButton>

          <Badge
            className={`absolute max-w-[calc(100%-2.5rem)] rounded-md font-bold uppercase leading-tight tracking-wide shadow-sm ${
              compact
                ? "bottom-1 left-1 px-1 py-0.5 text-[7px]"
                : "bottom-2 left-2 rounded-lg px-2 py-1 text-[9px]"
            } ${
              isBico
                ? "bg-emerald-100/95 text-emerald-800 hover:bg-emerald-100/95"
                : "bg-sky-100/95 text-sky-800 hover:bg-sky-100/95"
            }`}
          >
            {isBico ? "[Pedido de serviço]" : "[Profissional disponível]"}
          </Badge>
        </div>

        <div
          className={`flex flex-1 flex-col gap-0.5 px-(--card-spacing) pb-(--card-spacing) ${
            compact ? "pt-1.5" : "gap-1 pt-2.5"
          }`}
        >
          <h3
            className={`line-clamp-2 font-bold leading-snug text-foreground ${
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
            {formatListingPrice(listing)}
          </p>
          <p
            className={`line-clamp-1 text-muted-foreground ${
              compact ? "text-[8px]" : "text-[10px]"
            }`}
          >
            {locationShort} · {timeLabel}
          </p>
        </div>
      </Card>
    </Link>
  );
}
