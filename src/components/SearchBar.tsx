import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BRAZIL_STATES } from "../constants/categories";
import { useFilters } from "../context/FilterContext";
import { getCitiesByUf } from "../lib/brazilCities";
import { IconSearch } from "./icons/NavIcons";

interface SearchBarProps {
  onSearch?: () => void;
  variant?: "header" | "full";
}

export function SearchBar({ onSearch, variant = "full" }: SearchBarProps) {
  const navigate = useNavigate();
  const {
    filters,
    setSearch,
    applySearch,
    setLocation,
    locationLabel,
    locationDetecting,
  } = useFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [cidade, setCidade] = useState(filters.cidade);
  const [uf, setUf] = useState(filters.uf);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCidade(filters.cidade);
    setUf(filters.uf);
  }, [filters.cidade, filters.uf]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const ufCities = await getCitiesByUf(uf);
        if (cancelled) return;

        setCities(ufCities);
        if (ufCities.length === 0) return;

        setCidade((current) => {
          if (ufCities.includes(current)) return current;
          const nextCity = ufCities[0];
          setLocation(nextCity, uf);
          return nextCity;
        });
      } catch {
        if (!cancelled) setCities([]);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [uf, setLocation]);

  const applyRegion = (nextCidade: string, nextUf: string) => {
    const city = nextCidade.trim() || filters.cidade;
    const state = (nextUf || filters.uf).toUpperCase();
    setCidade(city);
    setUf(state);
    setLocation(city, state);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyRegion(cidade, uf);
    applySearch(localSearch.trim());
    navigate("/");
    setTimeout(() => onSearch?.(), 0);
  };

  const openSearchOrHome = () => {
    applyRegion(cidade, uf);
    const term = localSearch.trim();
    applySearch(term);
    if (term) {
      navigate("/buscar");
    } else {
      navigate("/");
    }
    onSearch?.();
  };

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
        placeholder={
          variant === "header"
            ? locationDetecting
              ? "Detectando localização..."
              : `Buscar em ${locationLabel}...`
            : "Ex: Encanador, Pintor, Designer..."
        }
        className={`min-w-0 flex-1 px-4 text-sm text-papufy-text outline-none placeholder:text-papufy-muted ${
          variant === "header" ? "py-2.5" : "px-5 py-3"
        }`}
        aria-label={variant === "header" ? "Buscar" : "Buscar serviços"}
      />
      <div className="flex items-center border-l border-papufy-border bg-gray-50/80 px-2">
        <select
          value={uf}
          onChange={(e) => {
            const nextUf = e.target.value;
            setUf(nextUf);
            // Cidade será ajustada pelo efeito das cidades do UF
          }}
          className={`max-w-[4rem] cursor-pointer border-0 bg-transparent text-sm font-semibold text-papufy-text outline-none ${
            variant === "header" ? "py-2.5" : "py-3"
          }`}
          aria-label="Estado"
        >
          {BRAZIL_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <select
          value={cidade}
          onChange={(e) => applyRegion(e.target.value, uf)}
          className={`cursor-pointer border-0 bg-transparent pl-1 text-sm text-papufy-text outline-none ${
            variant === "header" ? "w-28 py-2.5 sm:w-36" : "w-28 py-3 sm:w-36"
          }`}
          aria-label="Cidade"
          title={locationLabel}
          disabled={cities.length === 0}
        >
          {cities.length === 0 ? (
            <option value={cidade}>{cidade || "Cidade"}</option>
          ) : (
            cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))
          )}
        </select>
      </div>
      <Button
        type={variant === "header" ? "button" : "submit"}
        variant="papufy"
        className={`rounded-r-full rounded-l-none ${
          variant === "header" ? "px-4" : "px-5"
        }`}
        onClick={variant === "header" ? openSearchOrHome : undefined}
        aria-label={variant === "header" ? "Buscar na região" : "Buscar"}
      >
        <IconSearch className="h-5 w-5" />
      </Button>
    </form>
  );
}
