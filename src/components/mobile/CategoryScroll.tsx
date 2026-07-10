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
                className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 active:opacity-70"
              >
                <CategoryIcon
                  name={item.iconKey}
                  className={`h-7 w-7 ${
                    isActive ? "text-sky-700" : "text-sky-600"
                  }`}
                />
                <span
                  className={`line-clamp-2 w-full text-center text-[11px] leading-tight ${
                    isActive
                      ? "font-semibold text-sky-700"
                      : "font-medium text-sky-600"
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
