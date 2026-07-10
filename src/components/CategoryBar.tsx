import { CategoryIcon } from "./icons/CategoryIcons";
import {
  JOB_VACANCY_CATEGORIES,
  getCategoryMeta,
  type JobVacancyCategory,
} from "../constants/categories";
import { useFilters } from "../context/FilterContext";

interface CategoryBarProps {
  onCategorySelect?: () => void;
}

export function CategoryBar({ onCategorySelect }: CategoryBarProps) {
  const { filters, setCategory } = useFilters();

  const handleClick = (category: JobVacancyCategory) => {
    if (filters.category === category) {
      setCategory(null);
    } else {
      setCategory(category);
    }
    onCategorySelect?.();
  };

  return (
    <section className="border-y border-slate-200/80 bg-white">
      <div className="page-container py-3 lg:py-3.5">
        <div className="scrollbar-hide snap-x-mandatory flex justify-center gap-5 overflow-x-auto pb-0.5 sm:gap-7">
          {JOB_VACANCY_CATEGORIES.map((category) => {
            const meta = getCategoryMeta(category);
            const isActive = filters.category === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleClick(category)}
                className="snap-start flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1.5 transition active:opacity-70 sm:min-w-[5rem]"
              >
                <CategoryIcon
                  name={meta.iconKey}
                  className={`h-7 w-7 sm:h-8 sm:w-8 ${
                    isActive ? "text-sky-700" : "text-sky-600"
                  }`}
                />
                <span
                  className={`max-w-[5.5rem] text-center text-[11px] leading-tight sm:text-xs ${
                    isActive
                      ? "font-semibold text-sky-700"
                      : "font-medium text-sky-600"
                  }`}
                >
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
