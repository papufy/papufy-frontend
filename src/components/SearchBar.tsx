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
        if (ufCities.length > 0 && !ufCities.includes(cidade)) {
          setCidade(ufCities[0]);
        }
      } catch {
        if (!cancelled) setCities([]);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [uf, cidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextCidade = cidade.trim() || filters.cidade;
    const nextUf = uf || filters.uf;
    setLocation(nextCidade, nextUf);
    applySearch(localSearch.trim());
    if (variant === "header") {
      navigate("/");
      setTimeout(() => onSearch?.(), 0);
    } else {
      onSearch?.();
    }
  };

  const openSearchPage = () => {
    const nextCidade = cidade.trim() || filters.cidade;
    const nextUf = uf || filters.uf;
    setLocation(nextCidade, nextUf);
    applySearch(localSearch.trim());
    navigate("/buscar");
  };

  if (variant === "header") {
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
            locationDetecting
              ? "Detectando localização..."
              : `Buscar em ${locationLabel}...`
          }
          className="min-w-0 flex-1 px-4 py-2.5 text-sm text-papufy-text outline-none placeholder:text-papufy-muted"
          aria-label="Buscar"
        />
        <div className="flex items-center border-l border-papufy-border bg-gray-50/80 px-2">
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="max-w-[4rem] cursor-pointer border-0 bg-transparent py-2.5 text-sm font-semibold text-papufy-text outline-none"
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
            onChange={(e) => setCidade(e.target.value)}
            className="w-28 cursor-pointer border-0 bg-transparent py-2.5 pl-1 text-sm text-papufy-text outline-none sm:w-36"
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
          type="button"
          variant="papufy"
          className="rounded-r-full rounded-l-none px-4"
          onClick={openSearchPage}
          aria-label="Abrir busca"
        >
          <IconSearch className="h-5 w-5" />
        </Button>
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
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-28 cursor-pointer border-0 bg-transparent py-3 pl-1 text-sm text-papufy-text outline-none sm:w-36"
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
        type="submit"
        variant="papufy"
        className="rounded-r-full rounded-l-none px-5"
        aria-label="Buscar"
      >
        <IconSearch className="h-5 w-5" />
      </Button>
    </form>
  );
}
