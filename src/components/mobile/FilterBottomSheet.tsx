import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  JOB_VACANCY_CATEGORIES,
  PROFESSIONAL_PROFILE_CATEGORIES,
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
  const { filters, setCategory, setListingType, setPriceRange, resetFilters } =
    useFilters();
  const [min, setMin] = useState(
    filters.minPrice != null ? String(filters.minPrice) : ""
  );
  const [max, setMax] = useState(
    filters.maxPrice != null ? String(filters.maxPrice) : ""
  );
  const [listingTypeLocal, setListingTypeLocal] = useState(filters.listingType);
  const [catLocal, setCatLocal] = useState(filters.category);

  useEffect(() => {
    if (open) {
      setMin(filters.minPrice != null ? String(filters.minPrice) : "");
      setMax(filters.maxPrice != null ? String(filters.maxPrice) : "");
      setListingTypeLocal(filters.listingType);
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
    listingTypeLocal === "PROFESSIONAL_PROFILE"
      ? PROFESSIONAL_PROFILE_CATEGORIES
      : listingTypeLocal === "JOB_VACANCY"
        ? JOB_VACANCY_CATEGORIES
        : [...JOB_VACANCY_CATEGORIES, ...PROFESSIONAL_PROFILE_CATEGORIES];

  const apply = () => {
    setListingType(listingTypeLocal);
    setCategory(catLocal);
    setPriceRange(
      min ? parseFloat(min) : null,
      max ? parseFloat(max) : null
    );
    onApply();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 sm:bg-black/50"
        aria-label="Fechar filtros"
        onClick={onClose}
      />
      <div
        className="relative flex w-full max-h-[min(85dvh,640px)] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(28rem,90vh)] sm:max-w-md sm:rounded-2xl lg:max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <div className="flex shrink-0 justify-center py-2.5 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-300" aria-hidden />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:py-3.5">
          <h2 id="filter-title" className="text-base font-bold text-papufy-text sm:text-lg">
            Filtros
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="hidden h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 sm:flex"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:py-4">
          <p className="text-sm font-semibold text-papufy-text">Tipo</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {(
              [
                { v: null, l: "Todos" },
                { v: "JOB_VACANCY" as const, l: "Pedidos" },
                { v: "PROFESSIONAL_PROFILE" as const, l: "Profissionais" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.l}
                type="button"
                onClick={() => setListingTypeLocal(opt.v)}
                className={`h-10 rounded-xl border px-4 text-sm font-semibold active:scale-95 sm:h-9 sm:flex-initial ${
                  listingTypeLocal === opt.v
                    ? "border-sky-400 bg-sky-50 text-sky-600"
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
              className="input-field h-10 flex-1 rounded-xl sm:h-9"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Máx"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="input-field h-10 flex-1 rounded-xl sm:h-9"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-papufy-text">Categoria</p>
          <div className="mt-2 max-h-32 overflow-y-auto overscroll-contain sm:max-h-28">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCatLocal(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 ${
                  !catLocal
                    ? "bg-sky-500 text-white"
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
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 ${
                    catLocal === c
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-papufy-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-3.5">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 sm:h-9"
            onClick={() => {
              resetFilters();
              setMin("");
              setMax("");
              setListingTypeLocal(null);
              setCatLocal(null);
              onApply();
              onClose();
            }}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="papufy"
            className="h-10 flex-[2] sm:h-9"
            onClick={apply}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
