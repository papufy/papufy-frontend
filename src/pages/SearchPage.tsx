import { useMemo } from "react";
import { FadeContent } from "@/components/effects/FadeContent";
import { Skeleton } from "@/components/ui/skeleton";
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
    enabled: !locationDetecting,
  });

  const hasQuery = debouncedSearch.trim().length > 0;

  return (
    <MobileShell>
      <SearchBar autoFocusFullscreen />

      <div className="mobile-gutter space-y-4 py-4">
        <FadeContent>
          <header>
            <h1 className="text-lg font-bold text-foreground">
              {hasQuery ? "Busca" : "Na sua região"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {locationDetecting
                ? "Detectando localização..."
                : hasQuery
                  ? `"${debouncedSearch}" em ${locationLabel}`
                  : `Anúncios em ${locationLabel}`}
            </p>
          </header>
        </FadeContent>

        {loading && (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && listings.length === 0 && !error && (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum anúncio em {locationLabel}.
          </p>
        )}

        {listings.length > 0 && (
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
