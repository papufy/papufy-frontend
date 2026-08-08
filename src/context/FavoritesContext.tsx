import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { api } from "../lib/api";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const LEGACY_FAVORITES_KEY = "papufy_favorites";

function clearLegacyFavorites() {
  try {
    localStorage.removeItem(LEGACY_FAVORITES_KEY);
  } catch {
    /* ignore */
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const { showToast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearLegacyFavorites();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api.listings
      .listFavorites()
      .then(({ listingIds }) => {
        if (!cancelled) setFavoriteIds(new Set(listingIds));
      })
      .catch(() => {
        if (!cancelled) setFavoriteIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  const isFavorite = useCallback(
    (listingId: string) => favoriteIds.has(listingId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated) {
        showToast("Entre na conta para salvar favoritos.", "info");
        return;
      }
      const was = favoriteIds.has(listingId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (was) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      try {
        const { favorited } = await api.listings.toggleFavorite(listingId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (favorited) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
      } catch (err) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (was) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        showToast(
          err instanceof Error ? err.message : "Não foi possível salvar o favorito.",
          "error"
        );
      }
    },
    [favoriteIds, isAuthenticated, showToast]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, loading, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  }
  return ctx;
}
