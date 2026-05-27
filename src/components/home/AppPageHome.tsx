import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FilterBottomSheet } from "../mobile/FilterBottomSheet";
import { ListingCardMobile } from "../mobile/ListingCardMobile";
import { useFilters } from "../../context/FilterContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useInfiniteListings } from "../../hooks/useInfiniteListings";
import { getApiBase } from "../../lib/api";
import { FeaturedProfessionalsScroll } from "./FeaturedProfessionalsScroll";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { RecentJobsGrid } from "./RecentJobsGrid";

const FEATURED_COUNT = 6;
const PROFESSIONALS_COUNT = 8;

export function AppPageHome() {
  const { filters, locationLabel, locationDetecting } = useFilters();
  const debouncedSearch = useDebounce(filters.search, 400);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      listingType: filters.listingType || undefined,
      location: locationLabel,
      uf: filters.uf,
      cidade: filters.cidade,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
    }),
    [
      debouncedSearch,
      filters.category,
      filters.listingType,
      locationLabel,
      filters.uf,
      filters.cidade,
      filters.minPrice,
      filters.maxPrice,
    ]
  );

  const professionalsQuery = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      listingType: "PROFESSIONAL_PROFILE" as const,
      uf: filters.uf,
      cidade: filters.cidade,
    }),
    [
      debouncedSearch,
      filters.category,
      filters.uf,
      filters.cidade,
    ]
  );

  const {
    listings,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteListings(query, { enabled: !locationDetecting });

  const {
    listings: professionalListings,
    loading: professionalsLoading,
    refresh: refreshProfessionals,
  } = useInfiniteListings(professionalsQuery, {
    enabled: !locationDetecting,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

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
    refreshProfessionals();
  }, [refresh, refreshProfessionals]);

  const featuredProfessionals = professionalListings.slice(
    0,
    PROFESSIONALS_COUNT
  );

  const featuredListings = listings.slice(0, FEATURED_COUNT);
  const moreListings = listings.slice(FEATURED_COUNT);
  const searchTerm = debouncedSearch.trim();
  const hasSearch = searchTerm.length > 0;
  const featuredTitle = hasSearch ? "Resultados da busca" : "Serviços em Destaque";
  const featuredSubtitle = hasSearch
    ? locationDetecting
      ? "Detectando sua localização..."
      : `"${searchTerm}" em ${locationLabel}`
    : null;
  const regionSubtitle = locationDetecting
    ? "Detectando sua localização..."
    : hasSearch
      ? `"${searchTerm}" em ${locationLabel}`
      : `Em ${locationLabel}`;
  const showMoreSection =
    Boolean(error) || loading || moreListings.length > 0 || hasMore;

  return (
    <div className="flex flex-col space-y-4 pb-4 sm:space-y-6">
      <div className="mobile-gutter pt-0 sm:pt-2">
        <HomeHeroCarousel />
      </div>

      <div className="mobile-gutter space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <span className="sr-only">Filtros de listagem</span>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="ml-auto h-10 shrink-0 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm active:scale-95"
          >
            Filtros
          </button>
        </div>

        <RecentJobsGrid
          listings={featuredListings}
          loading={loading}
          locationLabel={locationLabel}
          locationDetecting={locationDetecting}
          title={featuredTitle}
          subtitle={featuredSubtitle}
        />

        <FeaturedProfessionalsScroll
          listings={featuredProfessionals}
          loading={professionalsLoading}
          locationLabel={locationLabel}
        />

        {showMoreSection && (
          <section>
            <header className="mb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Mais anúncios na região
              </h2>
              <p className="text-xs text-slate-500">{regionSubtitle}</p>
            </header>

            {loading && moreListings.length === 0 && featuredListings.length === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-lg bg-slate-200"
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
                  className="mt-3 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 text-sm font-bold text-white active:scale-95"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {moreListings.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {moreListings.map((listing) => (
                  <ListingCardMobile
                    key={listing.id}
                    listing={listing}
                    compact
                  />
                ))}
              </div>
            )}

            {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
            {loadingMore && (
              <p className="py-4 text-center text-xs text-slate-500">
                Carregando mais...
              </p>
            )}
            {!hasMore && moreListings.length > 0 && (
              <p className="py-4 text-center text-xs text-slate-500">
                Você viu todos os anúncios
              </p>
            )}
          </section>
        )}
      </div>

      <FilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleRefresh}
      />
    </div>
  );
}
