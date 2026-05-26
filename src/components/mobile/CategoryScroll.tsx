import {
  MACRO_SCROLL_CATEGORIES,
  type ListingTypeFilter,
} from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";
import type { JobFilters } from "../../context/FilterContext";

function resolveActiveMacroId(filters: JobFilters): string {
  const match = MACRO_SCROLL_CATEGORIES.find((macro) => {
    if (macro.id === "all") {
      return filters.tipo === null && filters.category === null;
    }
    if (macro.tipo !== null) {
      return filters.tipo === macro.tipo && filters.category === null;
    }
    if (macro.category !== null) {
      return filters.category === macro.category && filters.tipo === null;
    }
    return false;
  });
  return match?.id ?? "all";
}

interface CategoryScrollProps {
  onChange?: () => void;
}

export function CategoryScroll({ onChange }: CategoryScrollProps) {
  const { filters, setCategory, setTipo } = useFilters();
  const activeId = resolveActiveMacroId(filters);

  const applyMacro = (
    tipo: ListingTypeFilter,
    category: string | null
  ) => {
    setTipo(tipo);
    setCategory(category);
    onChange?.();
  };

  return (
    <section aria-label="Categorias" className="border-b border-slate-100/80 bg-white">
      <div
        className="scrollbar-hide overflow-x-auto px-4 py-2 touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-max min-w-full flex-nowrap justify-center gap-4">
        {MACRO_SCROLL_CATEGORIES.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => applyMacro(item.tipo, item.category)}
              className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1.5 active:scale-95"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl transition ${
                  isActive
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-100 bg-white"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`line-clamp-2 w-full text-center text-[11px] leading-tight ${
                  isActive
                    ? "font-semibold text-sky-600"
                    : "font-medium text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
}
