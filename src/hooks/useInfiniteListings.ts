import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Listing } from "../types";

const PAGE_SIZE = 20;

export interface ListingsQuery {
  search?: string;
  category?: string;
  listingType?: "JOB_VACANCY" | "PROFESSIONAL_PROFILE";
  location?: string;
  uf?: string;
  cidade?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function useInfiniteListings(
  query: ListingsQuery,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const queryRef = useRef(query);

  queryRef.current = query;
  const queryKey = JSON.stringify(query);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      const q = queryRef.current;
      const offset = reset ? 0 : offsetRef.current;
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let data = await api.listings.list({
          ...q,
          limit: PAGE_SIZE,
          offset,
        });

        // Se a cidade filtrada não tem anúncios, amplia para o Brasil
        // (evita home vazia quando o GPS aponta para outra região).
        if (
          reset &&
          data.listings.length === 0 &&
          (q.cidade || q.uf || q.location)
        ) {
          data = await api.listings.list({
            search: q.search,
            category: q.category,
            listingType: q.listingType,
            minPrice: q.minPrice,
            maxPrice: q.maxPrice,
            limit: PAGE_SIZE,
            offset: 0,
          });
        }

        setListings((prev) =>
          reset ? data.listings : [...prev, ...data.listings]
        );
        offsetRef.current = offset + data.listings.length;
        setHasMore(data.hasMore);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar anúncios."
        );
        if (reset) setListings([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [queryKey]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(true);
      return;
    }
    offsetRef.current = 0;
    void fetchPage(true);
  }, [queryKey, fetchPage, enabled]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    void fetchPage(false);
  }, [fetchPage, hasMore, loading, loadingMore]);

  const refresh = useCallback(() => {
    offsetRef.current = 0;
    void fetchPage(true);
  }, [fetchPage]);

  return {
    listings,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
