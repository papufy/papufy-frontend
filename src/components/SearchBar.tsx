import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAZIL_STATES } from "../constants/categories";
import { useFilters } from "../context/FilterContext";
import { IconSearch } from "./icons/NavIcons";

interface SearchBarProps {
  onSearch?: () => void;
  variant?: "header" | "full";
}

export function SearchBar({ onSearch, variant = "full" }: SearchBarProps) {
  const navigate = useNavigate();
  const { filters, setSearch, applySearch, setLocation, locationLabel } =
    useFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [cidade, setCidade] = useState(filters.cidade);
  const [uf, setUf] = useState(filters.uf);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch(localSearch.trim());
    setLocation(cidade.trim(), uf);
    if (variant === "header") {
      navigate("/");
      setTimeout(() => onSearch?.(), 0);
    } else {
      onSearch?.();
    }
  };

  if (variant === "header") {
    return (
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl flex-1">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            setSearch(e.target.value);
          }}
          placeholder="Buscar serviços, profissionais..."
          className="w-full rounded-full border border-papufy-border bg-white py-3 pl-5 pr-12 text-base text-papufy-text shadow-sm outline-none transition focus:border-papufy-orange focus:ring-2 focus:ring-papufy-orange/20 sm:py-2.5 sm:text-sm"
          aria-label="Buscar"
        />
        <button
          type="submit"
          className="touch-target absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-papufy-muted transition hover:bg-sky-50 hover:text-papufy-orange"
          aria-label="Buscar"
        >
          <IconSearch />
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl flex-1 items-stretch overflow-hidden rounded-full border border-papufy-border bg-white shadow-sm"
    >
      <input
        type="text"
        value={localSearch}
        onChange={(e) => {
          setLocalSearch(e.target.value);
          setSearch(e.target.value);
        }}
        placeholder="Ex: Encanador, Pintor, Designer..."
        className="min-w-0 flex-1 px-5 py-3 text-sm text-papufy-text outline-none placeholder:text-papufy-muted"
        aria-label="Buscar serviços"
      />
      <div className="flex items-center border-l border-papufy-border bg-gray-50/80 px-2">
        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          className="max-w-[4rem] cursor-pointer border-0 bg-transparent py-3 text-sm font-semibold text-papufy-text outline-none"
          aria-label="Estado"
        >
          {BRAZIL_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
          className="w-28 border-0 bg-transparent py-3 pl-1 text-sm text-papufy-text outline-none placeholder:text-papufy-muted sm:w-36"
          aria-label="Cidade"
          title={locationLabel}
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center rounded-r-full bg-papufy-orange px-5 text-white transition-colors hover:bg-papufy-orange-dark"
        aria-label="Buscar"
      >
        <IconSearch className="h-5 w-5" />
      </button>
    </form>
  );
}
