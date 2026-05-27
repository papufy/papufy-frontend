import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ListingTypeFilter } from "../constants/categories";
import {
  detectUserCity,
  isLocationManual,
  markLocationManual,
} from "../lib/geolocation";
import { normalizeListingType } from "../lib/listingType";

export interface JobFilters {
  search: string;
  category: string | null;
  listingType: ListingTypeFilter;
  minPrice: number | null;
  maxPrice: number | null;
  cidade: string;
  uf: string;
}

interface FilterContextValue {
  filters: JobFilters;
  locationLabel: string;
  /** true enquanto tenta GPS (só na 1ª carga, se o usuário não escolheu cidade manualmente). */
  locationDetecting: boolean;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setListingType: (listingType: ListingTypeFilter) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setLocation: (cidade: string, uf: string) => void;
  applySearch: (search: string) => void;
  clearCategory: () => void;
  resetFilters: () => void;
}

const STORAGE_KEY = "papufy_filters";

const DEFAULT_FILTERS: JobFilters = {
  search: "",
  category: null,
  listingType: null,
  minPrice: null,
  maxPrice: null,
  cidade: "Campina Grande",
  uf: "PB",
};

function loadFilters(): JobFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<JobFilters> & { tipo?: string };
      const listingType =
        normalizeListingType(parsed.listingType ?? parsed.tipo) ?? null;
      return {
        ...DEFAULT_FILTERS,
        ...parsed,
        listingType,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_FILTERS;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<JobFilters>(loadFilters);
  const [locationDetecting, setLocationDetecting] = useState(
    () => !isLocationManual()
  );

  const runAutoLocation = useCallback(async () => {
    if (isLocationManual()) {
      setLocationDetecting(false);
      return;
    }

    setLocationDetecting(true);
    try {
      const loc = await detectUserCity();
      if (loc) {
        setFilters((prev) => ({
          ...prev,
          cidade: loc.cidade,
          uf: loc.uf,
        }));
      }
    } finally {
      setLocationDetecting(false);
    }
  }, []);

  useEffect(() => {
    void runAutoLocation();
  }, [runAutoLocation]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void runAutoLocation();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [runAutoLocation]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cidade: filters.cidade,
        uf: filters.uf,
        category: filters.category,
        listingType: filters.listingType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      })
    );
  }, [
    filters.cidade,
    filters.uf,
    filters.category,
    filters.listingType,
    filters.minPrice,
    filters.maxPrice,
  ]);

  const locationLabel = `${filters.cidade}, ${filters.uf}`;

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const applySearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setListingType = useCallback((listingType: ListingTypeFilter) => {
    setFilters((prev) => ({ ...prev, listingType }));
  }, []);

  const setPriceRange = useCallback(
    (minPrice: number | null, maxPrice: number | null) => {
      setFilters((prev) => ({ ...prev, minPrice, maxPrice }));
    },
    []
  );

  const clearCategory = useCallback(() => {
    setFilters((prev) => ({ ...prev, category: null }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      cidade: prev.cidade,
      uf: prev.uf,
    }));
  }, []);

  const setLocation = useCallback((cidade: string, uf: string) => {
    const nextCidade = cidade.trim();
    const nextUf = uf.trim().toUpperCase();
    setFilters((prev) => {
      const changed =
        prev.cidade !== nextCidade || prev.uf.toUpperCase() !== nextUf;
      if (changed) markLocationManual();
      return { ...prev, cidade: nextCidade, uf: nextUf };
    });
    setLocationDetecting(false);
  }, []);

  const value = useMemo(
    () => ({
      filters,
      locationLabel,
      locationDetecting,
      setSearch,
      setCategory,
      setListingType,
      setPriceRange,
      setLocation,
      applySearch,
      clearCategory,
      resetFilters,
    }),
    [
      filters,
      locationLabel,
      locationDetecting,
      setSearch,
      setCategory,
      setListingType,
      setPriceRange,
      setLocation,
      applySearch,
      clearCategory,
      resetFilters,
    ]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters deve ser usado dentro de FilterProvider");
  }
  return ctx;
}
