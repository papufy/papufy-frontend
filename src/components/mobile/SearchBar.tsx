import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAZIL_STATES } from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";
import { IconSearch } from "../icons/NavIcons";

const RECENT_KEY = "papufy_recent_searches";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const list = [trimmed, ...loadRecent().filter((t) => t !== trimmed)].slice(
    0,
    8
  );
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

interface SearchBarProps {
  onSearch?: () => void;
  autoFocusFullscreen?: boolean;
}

export function SearchBar({
  onSearch,
  autoFocusFullscreen = false,
}: SearchBarProps) {
  const navigate = useNavigate();
  const {
    filters,
    locationLabel,
    locationDetecting,
    detectLocation,
    setSearch,
    applySearch,
    setLocation,
  } = useFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [fullscreen, setFullscreen] = useState(autoFocusFullscreen);
  const [cidade, setCidade] = useState(filters.cidade);
  const [uf, setUf] = useState(filters.uf);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [gpsLoading, setGpsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCidade(filters.cidade);
    setUf(filters.uf);
  }, [filters.cidade, filters.uf]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      setCidade(filters.cidade);
      setUf(filters.uf);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen, filters.cidade, filters.uf]);

  useEffect(() => {
    if (autoFocusFullscreen) setFullscreen(true);
  }, [autoFocusFullscreen]);

  const applyLocationFromForm = () => {
    const nextCidade = cidade.trim() || filters.cidade;
    const nextUf = uf || filters.uf;
    setLocation(nextCidade, nextUf);
  };

  const commitSearch = (term: string) => {
    applySearch(term);
    saveRecent(term);
    setRecent(loadRecent());
    setFullscreen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
    }
    onSearch?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyLocationFromForm();
    commitSearch(localSearch.trim());
  };

  const handleRecent = (term: string) => {
    setLocalSearch(term);
    applyLocationFromForm();
    commitSearch(term);
  };

  const handleUseGps = async () => {
    setGpsLoading(true);
    try {
      await detectLocation();
    } finally {
      setGpsLoading(false);
    }
  };

  const locationHint = locationDetecting
    ? "Detectando localização..."
    : `Buscando em ${locationLabel}`;

  return (
    <>
      <div className="mobile-gutter py-2">
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="flex w-full select-none items-center gap-3 rounded-2xl border border-papufy-border bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.99]"
        >
          <IconSearch className="h-5 w-5 shrink-0 text-papufy-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-papufy-muted">
              {filters.search || "Buscar bicos, produtos, serviços..."}
            </p>
            <p className="truncate text-xs font-semibold text-sky-600">
              {locationHint} 📍
            </p>
          </div>
        </button>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <form
            onSubmit={handleSubmit}
            className="border-b border-papufy-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="touch-target shrink-0 text-sm font-semibold text-sky-600"
              >
                Cancelar
              </button>
              <div className="relative min-w-0 flex-1">
                <input
                  ref={inputRef}
                  type="search"
                  enterKeyHint="search"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearch(e.target.value);
                  }}
                  placeholder={`Buscar em ${filters.cidade}...`}
                  className="w-full rounded-full border border-papufy-border py-3 pl-4 pr-11 text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
                />
                <button
                  type="submit"
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 text-sky-600"
                  aria-label="Buscar"
                >
                  <IconSearch />
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] font-medium text-papufy-muted">
              {locationDetecting || gpsLoading
                ? "Detectando sua localização..."
                : `Resultados em ${locationLabel}`}
            </p>

            <div className="mt-3 flex gap-2">
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="h-11 shrink-0 rounded-xl border border-papufy-border bg-gray-50 px-2 text-sm font-semibold outline-none"
                aria-label="Estado"
              >
                {BRAZIL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade"
                className="input-field h-11 min-w-0 flex-1 rounded-xl"
                aria-label="Cidade"
              />
              <button
                type="button"
                onClick={() => void handleUseGps()}
                disabled={gpsLoading || locationDetecting}
                className="h-11 shrink-0 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700 active:scale-95 disabled:opacity-50"
              >
                GPS
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {recent.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wide text-papufy-muted">
                  Buscas recentes · {locationLabel}
                </h3>
                <ul className="mt-2 space-y-1">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => handleRecent(term)}
                        className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-papufy-text active:bg-sky-50"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
