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
  clearLocationManual,
  detectUserCity,
  isLocationManual,
  markLocationManual,
} from "../lib/geolocation";

export interface JobFilters {
  search: string;
  category: string | null;
  tipo: ListingTypeFilter;
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
  /** Atualiza cidade/UF pelo GPS (ex.: botão na busca). */
  detectLocation: () => Promise<void>;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setTipo: (tipo: ListingTypeFilter) => void;
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
  tipo: null,
  minPrice: null,
  maxPrice: null,
  cidade: "Campina Grande",
  uf: "PB",
};

function loadFilters(): JobFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
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

  useEffect(() => {
    if (isLocationManual()) {
      setLocationDetecting(false);
      return;
    }

    let cancelled = false;

    void detectUserCity().then((loc) => {
      if (cancelled) return;
      if (loc) {
        setFilters((prev) => ({
          ...prev,
          cidade: loc.cidade,
          uf: loc.uf,
        }));
      }
      setLocationDetecting(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cidade: filters.cidade,
        uf: filters.uf,
        category: filters.category,
        tipo: filters.tipo,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      })
    );
  }, [
    filters.cidade,
    filters.uf,
    filters.category,
    filters.tipo,
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

  const setTipo = useCallback((tipo: ListingTypeFilter) => {
    setFilters((prev) => ({ ...prev, tipo }));
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
    markLocationManual();
    setLocationDetecting(false);
    setFilters((prev) => ({ ...prev, cidade, uf }));
  }, []);

  const detectLocation = useCallback(async () => {
    setLocationDetecting(true);
    try {
      const loc = await detectUserCity();
      if (loc) {
        clearLocationManual();
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

  const value = useMemo(
    () => ({
      filters,
      locationLabel,
      locationDetecting,
      detectLocation,
      setSearch,
      setCategory,
      setTipo,
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
      detectLocation,
      setSearch,
      setCategory,
      setTipo,
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
