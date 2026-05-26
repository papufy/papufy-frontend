import { JOB_CATEGORIES, CATEGORY_META, type JobCategory } from "../constants/categories";
import { useFilters } from "../context/FilterContext";

interface CategoryBarProps {
  onCategorySelect?: () => void;
}

export function CategoryBar({ onCategorySelect }: CategoryBarProps) {
  const { filters, setCategory } = useFilters();

  const handleClick = (category: JobCategory) => {
    if (filters.category === category) {
      setCategory(null);
    } else {
      setCategory(category);
    }
    onCategorySelect?.();
  };

  return (
    <section className="border-b border-papufy-border bg-white shadow-sm">
      <div className="page-container py-2.5 lg:py-3">
        <div className="scrollbar-hide snap-x-mandatory flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
          {JOB_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = filters.category === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleClick(category)}
                className={`snap-start flex min-w-[80px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-2.5 transition sm:min-w-[88px] sm:gap-2 sm:px-3 sm:py-3 ${
                  isActive
                    ? "border-papufy-orange bg-sky-50 shadow-sm"
                    : "border-papufy-border bg-white hover:border-papufy-orange/50 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg sm:h-11 sm:w-11 sm:text-xl ${
                    isActive ? "bg-papufy-orange text-white" : meta.color
                  }`}
                >
                  {meta.icon}
                </span>
                <span
                  className={`max-w-[90px] text-center text-xs font-medium leading-tight ${
                    isActive ? "text-papufy-orange" : "text-papufy-text"
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
