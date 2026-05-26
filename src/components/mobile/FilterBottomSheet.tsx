import { useEffect, useState } from "react";
import {
  BICO_CATEGORIES,
  PROFESSIONAL_CATEGORIES,
} from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}

export function FilterBottomSheet({
  open,
  onClose,
  onApply,
}: FilterBottomSheetProps) {
  const { filters, setCategory, setTipo, setPriceRange, resetFilters } =
    useFilters();
  const [min, setMin] = useState(
    filters.minPrice != null ? String(filters.minPrice) : ""
  );
  const [max, setMax] = useState(
    filters.maxPrice != null ? String(filters.maxPrice) : ""
  );
  const [tipoLocal, setTipoLocal] = useState(filters.tipo);
  const [catLocal, setCatLocal] = useState(filters.category);

  useEffect(() => {
    if (open) {
      setMin(filters.minPrice != null ? String(filters.minPrice) : "");
      setMax(filters.maxPrice != null ? String(filters.maxPrice) : "");
      setTipoLocal(filters.tipo);
      setCatLocal(filters.category);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, filters]);

  if (!open) return null;

  const categories =
    tipoLocal === "PROFESSIONAL_PROFILE"
      ? PROFESSIONAL_CATEGORIES
      : tipoLocal === "JOB_VACANCY"
        ? BICO_CATEGORIES
        : [...BICO_CATEGORIES, ...PROFESSIONAL_CATEGORIES];

  const apply = () => {
    setTipo(tipoLocal);
    setCategory(catLocal);
    setPriceRange(
      min ? parseFloat(min) : null,
      max ? parseFloat(max) : null
    );
    onApply();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar filtros"
        onClick={onClose}
      />
      <div
        className="relative max-h-[85dvh] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <div className="flex justify-center py-3">
          <span className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 pb-6">
          <h2 id="filter-title" className="text-lg font-bold text-papufy-text">
            Filtros
          </h2>

          <p className="mt-4 text-sm font-semibold text-papufy-text">Tipo</p>
          <div className="mt-2 flex gap-2">
            {(
              [
                { v: null, l: "Todos" },
                { v: "JOB_VACANCY" as const, l: "Pedidos de serviço" },
                {
                  v: "PROFESSIONAL_PROFILE" as const,
                  l: "Profissionais",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.l}
                type="button"
                onClick={() => setTipoLocal(opt.v)}
                className={`h-11 flex-1 rounded-xl border text-sm font-semibold active:scale-95 ${
                  tipoLocal === opt.v
                    ? "border-papufy-orange bg-sky-50 text-papufy-orange"
                    : "border-papufy-border text-papufy-muted"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm font-semibold text-papufy-text">
            Faixa de preço (R$)
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Mín"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="input-field h-12 flex-1 rounded-xl"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Máx"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="input-field h-12 flex-1 rounded-xl"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-papufy-text">Categoria</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCatLocal(null)}
              className={`rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
                !catLocal
                  ? "bg-papufy-orange text-white"
                  : "bg-gray-100 text-papufy-muted"
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatLocal(c)}
                className={`rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
                  catLocal === c
                    ? "bg-papufy-orange text-white"
                    : "bg-gray-100 text-papufy-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t border-papufy-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              resetFilters();
              setMin("");
              setMax("");
              setTipoLocal(null);
              setCatLocal(null);
              onApply();
              onClose();
            }}
            className="h-12 flex-1 rounded-xl border border-papufy-border text-sm font-semibold text-papufy-muted active:scale-95"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={apply}
            className="h-12 flex-[2] rounded-xl bg-papufy-orange text-sm font-bold text-white active:scale-95"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
