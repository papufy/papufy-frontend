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
                className="group snap-start flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1.5 outline-none sm:min-w-[5rem]"
              >
                <span className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-2xl transition duration-300 ease-out ${
                      isActive
                        ? "scale-100 bg-sky-400/20 opacity-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                        : "scale-75 bg-sky-400/0 opacity-0 group-hover:scale-100 group-hover:bg-sky-400/18 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] group-focus-visible:scale-100 group-focus-visible:bg-sky-400/18 group-focus-visible:opacity-100"
                    }`}
                  />
                  <CategoryIcon
                    name={meta.iconKey}
                    className={`relative z-10 h-7 w-7 transition duration-300 ease-out sm:h-8 sm:w-8 ${
                      isActive
                        ? "scale-105 text-sky-700"
                        : "text-sky-600 group-hover:scale-110 group-hover:text-sky-700 group-focus-visible:scale-110 group-focus-visible:text-sky-700"
                    }`}
                  />
                </span>
                <span
                  className={`max-w-[5.5rem] text-center text-[11px] leading-tight transition duration-300 sm:text-xs ${
                    isActive
                      ? "font-semibold text-sky-700"
                      : "font-medium text-sky-600 group-hover:font-semibold group-hover:text-sky-700"
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
