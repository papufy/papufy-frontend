import { useMemo } from "react";
import { MobileShell } from "../components/mobile/MobileShell";
import { SearchBar } from "../components/mobile/SearchBar";
import { ListingCardMobile } from "../components/mobile/ListingCardMobile";
import { useFilters } from "../context/FilterContext";
import { useDebounce } from "../hooks/useDebounce";
import { useInfiniteListings } from "../hooks/useInfiniteListings";

export function SearchPage() {
  const { filters, locationLabel, locationDetecting } = useFilters();
  const debouncedSearch = useDebounce(filters.search, 400);

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      listingType: filters.listingType || undefined,
      location: `${filters.cidade}, ${filters.uf}`,
      uf: filters.uf,
      cidade: filters.cidade,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
    }),
    [
      debouncedSearch,
      filters.category,
      filters.listingType,
      filters.cidade,
      filters.uf,
      filters.minPrice,
      filters.maxPrice,
    ]
  );

  const { listings, loading, error } = useInfiniteListings(query, {
    enabled: !locationDetecting && debouncedSearch.trim().length > 0,
  });

  const hasQuery = debouncedSearch.trim().length > 0;

  return (
    <MobileShell>
      <SearchBar autoFocusFullscreen />

      <div className="mobile-gutter space-y-4 py-4">
        {!hasQuery && (
          <p className="text-center text-sm text-papufy-muted">
            Digite o que procura. A busca usa sua localização (
            {locationDetecting ? "detectando..." : locationLabel}).
          </p>
        )}

        {hasQuery && (
          <header>
            <h1 className="text-lg font-bold text-papufy-text">Busca</h1>
            <p className="mt-1 text-xs text-papufy-muted">
              {locationDetecting
                ? "Detectando localização..."
                : `"${debouncedSearch}" em ${locationLabel}`}
            </p>
          </header>
        )}

        {hasQuery && loading && (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-slate-200"
              />
            ))}
          </div>
        )}

        {hasQuery && error && !loading && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {hasQuery && !loading && listings.length === 0 && !error && (
          <p className="text-center text-sm text-papufy-muted">
            Nenhum resultado em {locationLabel}.
          </p>
        )}

        {hasQuery && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {listings.map((listing) => (
              <ListingCardMobile key={listing.id} listing={listing} compact />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
