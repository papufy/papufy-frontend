import { useCallback, useEffect, useRef, useState } from "react";
import { FilterBottomSheet } from "../mobile/FilterBottomSheet";
import { ListingCardMobile } from "../mobile/ListingCardMobile";
import { useFilters } from "../../context/FilterContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useInfiniteListings } from "../../hooks/useInfiniteListings";
import { getApiBase } from "../../lib/api";
import { FeaturedProfessionalsScroll } from "./FeaturedProfessionalsScroll";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { RecentJobsGrid } from "./RecentJobsGrid";

export function AppPageHome() {
  const { filters, locationLabel } = useFilters();
  const debouncedSearch = useDebounce(filters.search, 400);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const query = {
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    listingType: filters.tipo || undefined,
    location: locationLabel,
    uf: filters.uf,
    cidade: filters.cidade,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  };

  const {
    listings,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteListings(query);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="section-stack-lg pb-6 pt-5">
      <section className="page-container">
        <HomeHeroCarousel />
      </section>

      <div className="page-container section-stack">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-papufy-border bg-white px-4 text-xs font-bold text-papufy-text shadow-sm active:scale-95"
          >
            <svg
              className="h-4 w-4 text-papufy-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            Filtros
          </button>
        </div>

        <RecentJobsGrid subtitle={`Perto de ${locationLabel}`} />

        <FeaturedProfessionalsScroll />

        {(loading || listings.length > 0 || error) && (
          <section>
            <header className="mb-4">
              <h2 className="text-2xl font-bold tracking-tight text-papufy-text">
                Mais anúncios na região
              </h2>
              <p className="mt-1 text-sm text-papufy-muted">
                Serviços e profissionais do marketplace Papufy
              </p>
            </header>

            {loading && listings.length === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
            )}

            {error && !loading && listings.length === 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2 text-xs">
                  API:{" "}
                  <code className="rounded bg-red-100 px-1">{getApiBase()}</code>
                </p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-3 h-11 rounded-xl bg-papufy-orange px-4 text-sm font-bold text-white active:scale-95"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {listings.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {listings.map((listing) => (
                    <ListingCardMobile key={listing.id} listing={listing} />
                  ))}
                </div>
                <div ref={sentinelRef} className="h-4" aria-hidden />
                {loadingMore && (
                  <p className="py-4 text-center text-xs text-papufy-muted">
                    Carregando mais...
                  </p>
                )}
                {!hasMore && (
                  <p className="py-4 text-center text-xs text-papufy-muted">
                    Você viu todos os anúncios
                  </p>
                )}
              </>
            )}
          </section>
        )}
      </div>

      <FilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={refresh}
      />
    </div>
  );
}
