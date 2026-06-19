import { Link } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryMeta } from "../../constants/categories";
import type { Listing } from "../../types";
import { formatPrice, formatRelativeTime } from "../../utils/format";

interface FeaturedProfessionalsScrollProps {
  listings: Listing[];
  loading?: boolean;
  locationLabel: string;
}

export function FeaturedProfessionalsScroll({
  listings,
  loading = false,
  locationLabel,
}: FeaturedProfessionalsScrollProps) {
  if (!loading && listings.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <FadeContent>
      <header className="mb-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Profissionais em Destaque
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Perfis reais em {locationLabel}
        </p>
      </header>
      </FadeContent>

      {loading && listings.length === 0 ? (
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[168px] w-[148px] shrink-0 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div
          className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 touch-pan-x snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {listings.map((listing) => {
            const meta = getCategoryMeta(listing.categoria);
            const cover = listing.imagemCapa;
            const showImage = Boolean(cover && !cover.includes("placeholders/"));

            return (
              <article
                key={listing.id}
                className="w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border border-papufy-border bg-white shadow-sm"
              >
                <Link to={`/anuncio/${listing.id}`} className="block active:scale-[0.98]">
                  <div className="relative flex h-20 items-center justify-center bg-slate-100">
                    {showImage ? (
                      <img
                        src={cover!}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden>
                        {meta.icon}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-bold leading-tight text-papufy-text">
                      {listing.titulo}
                    </p>
                    <p className="mt-1 text-xs font-bold text-sky-600">
                      {formatPrice(listing.preco ?? null, listing.aCombinar)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[10px] text-papufy-muted">
                      {listing.categoria} · {formatRelativeTime(listing.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="border-t border-slate-100 px-3 pb-3">
                  <Link
                    to={`/anuncio/${listing.id}`}
                    className="mt-2 flex w-full items-center justify-center rounded-full border-2 border-sky-400 py-1.5 text-[10px] font-bold text-sky-600 active:scale-95"
                  >
                    Ver perfil
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
