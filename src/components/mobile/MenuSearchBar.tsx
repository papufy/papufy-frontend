import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BRAZIL_STATES } from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";
import {
  IconChevronDown,
  IconMapPin,
  IconSearch,
} from "../icons/NavIcons";

interface MenuSearchBarProps {
  /** Remove padding externo quando embutido no shell fixo */
  compact?: boolean;
}

export function MenuSearchBar({ compact = false }: MenuSearchBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { filters, applySearch, setLocation, locationDetecting } =
    useFilters();
  const [query, setQuery] = useState(filters.search);

  useEffect(() => {
    setQuery(filters.search);
  }, [filters.search]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applySearch(query.trim());
    if (pathname !== "/" && pathname !== "/buscar") {
      navigate("/");
    }
  };

  const handleUfChange = (uf: string) => {
    setLocation(filters.cidade, uf);
  };

  const placeholder = locationDetecting
    ? "Detectando localização..."
    : query.trim()
      ? undefined
      : 'Buscar "serviços"';

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "w-full"
          : "border-b border-slate-100/80 bg-white px-3 py-2.5"
      }
      aria-label="Buscar no Papufy"
    >
      <div className="flex h-11 w-full items-stretch overflow-hidden rounded-full bg-[#f0f2f5] shadow-sm ring-1 ring-slate-200/60">
        <label className="sr-only" htmlFor="menu-search-input">
          Termo de busca
        </label>
        <div className="flex min-w-0 flex-1 items-center px-3.5">
          <input
            id="menu-search-input"
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full min-w-0 border-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-500"
          />
        </div>

        <div className="my-2 w-px shrink-0 bg-slate-300/70" aria-hidden />

        <div className="relative flex shrink-0 items-center gap-0.5 pl-2 pr-1">
          <IconMapPin className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
          <label className="sr-only" htmlFor="menu-search-uf">
            Estado (UF)
          </label>
          <select
            id="menu-search-uf"
            value={filters.uf}
            onChange={(e) => handleUfChange(e.target.value)}
            disabled={locationDetecting}
            className="max-w-[2.75rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-4 text-sm font-semibold text-slate-700 outline-none disabled:opacity-50"
          >
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          <IconChevronDown
            className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-slate-500"
            aria-hidden
          />
        </div>

        <div className="my-2 w-px shrink-0 bg-slate-300/70" aria-hidden />

        <button
          type="submit"
          className="flex w-11 shrink-0 items-center justify-center text-slate-600 transition active:bg-slate-200/80"
          aria-label="Buscar"
        >
          <IconSearch className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
