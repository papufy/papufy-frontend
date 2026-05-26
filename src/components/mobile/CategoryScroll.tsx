import { SCROLL_CATEGORIES } from "../../constants/categories";
import { useFilters } from "../../context/FilterContext";

const ICON_BG: Record<string, string> = {
  all: "bg-gradient-to-br from-papufy-orange to-orange-600 text-white shadow-md shadow-orange-200",
  vacancy: "bg-gradient-to-br from-sky-400 to-blue-600 text-white",
  produto: "bg-gradient-to-br from-violet-400 to-purple-700 text-white",
  default: "bg-gradient-to-br from-gray-50 to-gray-100 text-2xl",
};

function iconBg(id: string, isActive: boolean): string {
  if (isActive && id === "all") return ICON_BG.all;
  if (isActive) return "bg-papufy-purple text-white ring-2 ring-papufy-purple/30 shadow-md";
  if (id === "all") return "bg-gradient-to-br from-sky-500 to-blue-600 text-white";
  if (id === "vacancy") return ICON_BG.vacancy;
  if (id === "produto") return ICON_BG.produto;
  return ICON_BG.default;
}

interface CategoryScrollProps {
  onChange?: () => void;
}

export function CategoryScroll({ onChange }: CategoryScrollProps) {
  const { filters, setCategory, setTipo } = useFilters();

  const activeId =
    SCROLL_CATEGORIES.find(
      (c) =>
        (c.tipo === filters.tipo || (!c.tipo && !filters.tipo)) &&
        ("category" in c ? c.category === filters.category : !filters.category)
    )?.id ?? "all";

  return (
    <section aria-label="Categorias">
      <div
        className="scrollbar-hide page-container flex gap-3 overflow-x-auto pb-1 pt-1 touch-pan-x snap-x-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {SCROLL_CATEGORIES.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTipo(item.tipo);
                setCategory("category" in item ? item.category! : null);
                onChange?.();
              }}
              className="snap-start flex w-[76px] shrink-0 flex-col items-center gap-2 active:scale-95"
            >
              <span
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-[22px] transition ${iconBg(item.id, isActive)}`}
              >
                {item.icon}
              </span>
              <span
                className={`line-clamp-2 w-full text-center text-[11px] font-semibold leading-tight ${
                  isActive ? "text-papufy-orange" : "text-papufy-text"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
