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

function IconPin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
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
  const { filters, locationLabel, setSearch, applySearch, setLocation } =
    useFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [fullscreen, setFullscreen] = useState(autoFocusFullscreen);
  const [cidade, setCidade] = useState(filters.cidade);
  const [uf, setUf] = useState(filters.uf);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    if (autoFocusFullscreen) setFullscreen(true);
  }, [autoFocusFullscreen]);

  const commitSearch = (term: string) => {
    applySearch(term);
    saveRecent(term);
    setRecent(loadRecent());
    setFullscreen(false);
    navigate("/");
    onSearch?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(cidade.trim(), uf);
    commitSearch(localSearch.trim());
  };

  return (
    <>
      <div className="page-container pt-3">
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="flex w-full select-none items-stretch overflow-hidden rounded-xl border border-papufy-border bg-white text-left shadow-md transition active:scale-[0.99]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5">
            <IconSearch className="h-5 w-5 shrink-0 text-papufy-muted" />
            <span className="truncate text-sm text-papufy-muted">
              {filters.search || "Buscar serviços, profissionais..."}
            </span>
          </div>

          <div className="flex w-[42%] max-w-[160px] shrink-0 items-center gap-1.5 border-l border-papufy-border bg-gray-50/80 px-3 py-3.5">
            <IconPin className="h-4 w-4 shrink-0 text-papufy-orange" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-papufy-text">
              {locationLabel}
            </span>
            <svg
              className="h-3.5 w-3.5 shrink-0 text-papufy-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <form
            onSubmit={handleSubmit}
            className="border-b border-papufy-border px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="touch-target shrink-0 text-sm font-semibold text-papufy-orange"
              >
                Cancelar
              </button>
              <div className="relative min-w-0 flex-1">
                <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-papufy-muted" />
                <input
                  ref={inputRef}
                  type="search"
                  enterKeyHint="search"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearch(e.target.value);
                  }}
                  placeholder="Buscar serviços, profissionais..."
                  className="w-full rounded-xl border border-papufy-border py-3.5 pl-11 pr-12 text-base shadow-sm outline-none focus:border-papufy-orange focus:ring-2 focus:ring-papufy-orange/20"
                />
                <button
                  type="submit"
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-papufy-orange px-3 py-1.5 text-xs font-bold text-white"
                  aria-label="Buscar"
                >
                  OK
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="h-11 shrink-0 rounded-xl border border-papufy-border bg-gray-50 px-3 text-sm font-semibold outline-none"
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
              />
            </div>
          </form>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {recent.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wide text-papufy-muted">
                  Buscas recentes
                </h3>
                <ul className="mt-2 space-y-1">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => {
                          setLocalSearch(term);
                          commitSearch(term);
                        }}
                        className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-papufy-text active:bg-papufy-tint"
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
