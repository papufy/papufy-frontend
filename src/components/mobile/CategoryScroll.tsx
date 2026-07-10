import { CategoryIcon } from "../icons/CategoryIcons";
import {
  MACRO_SCROLL_CATEGORIES,
  type ListingTypeFilter,
} from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";
import type { JobFilters } from "../../context/FilterContext";

function resolveActiveMacroId(filters: JobFilters): string {
  const match = MACRO_SCROLL_CATEGORIES.find((macro) => {
    if (macro.id === "all") {
      return filters.listingType === null && filters.category === null;
    }
    if (macro.listingType !== null) {
      return (
        filters.listingType === macro.listingType && filters.category === null
      );
    }
    if (macro.category !== null) {
      return filters.category === macro.category && filters.listingType === null;
    }
    return false;
  });
  return match?.id ?? "all";
}

interface CategoryScrollProps {
  onChange?: () => void;
}

export function CategoryScroll({ onChange }: CategoryScrollProps) {
  const { filters, setCategory, setListingType } = useFilters();
  const activeId = resolveActiveMacroId(filters);

  const applyMacro = (
    listingType: ListingTypeFilter,
    category: string | null
  ) => {
    setListingType(listingType);
    setCategory(category);
    onChange?.();
  };

  return (
    <section aria-label="Categorias" className="border-y border-slate-200/80 bg-white">
      <div
        className="scrollbar-hide overflow-x-auto px-3 py-3 touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-max min-w-full flex-nowrap justify-center gap-5 sm:gap-6">
          {MACRO_SCROLL_CATEGORIES.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyMacro(item.listingType, item.category)}
                className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 outline-none"
              >
                <span className="relative flex h-11 w-11 items-center justify-center">
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-2xl transition duration-300 ease-out ${
                      isActive
                        ? "scale-100 bg-sky-400/20 opacity-100 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                        : "scale-75 bg-sky-400/0 opacity-0 group-hover:scale-100 group-hover:bg-sky-400/18 group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(56,189,248,0.3)] group-focus-visible:scale-100 group-focus-visible:bg-sky-400/18 group-focus-visible:opacity-100"
                    }`}
                  />
                  <CategoryIcon
                    name={item.iconKey}
                    className={`relative z-10 h-7 w-7 transition duration-300 ease-out ${
                      isActive
                        ? "scale-105 text-sky-700"
                        : "text-sky-600 group-hover:scale-110 group-hover:text-sky-700 group-focus-visible:scale-110 group-focus-visible:text-sky-700"
                    }`}
                  />
                </span>
                <span
                  className={`line-clamp-2 w-full text-center text-[11px] leading-tight transition duration-300 ${
                    isActive
                      ? "font-semibold text-sky-700"
                      : "font-medium text-sky-600 group-hover:font-semibold group-hover:text-sky-700"
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
