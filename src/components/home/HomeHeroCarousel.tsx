import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFilters } from "../../context/FilterContext";
import {
  HERO_BANNER_HEIGHT,
  HERO_BANNER_WIDTH,
  HERO_SLIDES,
  type HeroSlide,
  type HeroSlideAction,
} from "../../data/homeMocks";

const AUTO_MS = 5500;
const SWIPE_THRESHOLD = 48;

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-4 w-4 sm:h-5 sm:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function HeroBannerImage({
  slide,
  priority,
}: {
  slide: HeroSlide;
  priority?: boolean;
}) {
  return (
    <img
      src={slide.src}
      alt={slide.alt}
      width={HERO_BANNER_WIDTH}
      height={HERO_BANNER_HEIGHT}
      className="h-full w-full origin-center object-contain object-center max-sm:scale-[1.25] sm:scale-100 sm:object-cover"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
    />
  );
}

function useSlideAction() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setCategory, setListingType } = useFilters();

  return useCallback(
    (action: HeroSlideAction) => {
      if (action.type === "filter") {
        setListingType(null);
        setCategory(action.category);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const listingType = action.listingType;
      if (isAuthenticated) {
        navigate("/anunciar/tipo", { state: { listingType } });
        return;
      }
      navigate("/entrar", {
        state: { redirect: "/anunciar/tipo", listingType },
      });
    },
    [isAuthenticated, navigate, setCategory, setListingType]
  );
}

function HeroSlidePanel({
  slide,
  priority,
  onAction,
}: {
  slide: HeroSlide;
  priority?: boolean;
  onAction: (action: HeroSlideAction) => void;
}) {
  const frame = (
    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 sm:aspect-[1576/300]">
      <HeroBannerImage slide={slide} priority={priority} />
    </div>
  );

  if (!slide.action) {
    return frame;
  }

  return (
    <button
      type="button"
      onClick={() => onAction(slide.action!)}
      className="block w-full text-left active:scale-[0.99] active:opacity-95"
      aria-label={slide.alt}
    >
      {frame}
    </button>
  );
}

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const paused = useRef(false);
  const total = HERO_SLIDES.length;
  const runSlideAction = useSlideAction();

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) goTo(index + 1);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [index, goTo]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    paused.current = true;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();
    touchStartX.current = null;
    setTimeout(() => {
      paused.current = false;
    }, 2000);
  };

  const navBtnClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-600 shadow-sm active:scale-95 sm:h-10 sm:w-10";

  return (
    <section
      className="w-full select-none"
      aria-roledescription="carousel"
      aria-label="Destaques Papufy"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={prev}
          className={`${navBtnClass} hidden sm:flex`}
          aria-label="Banner anterior"
        >
          <IconChevron direction="left" />
        </button>

        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {HERO_SLIDES.map((slide, i) => (
              <div key={slide.id} className="w-full shrink-0">
                <HeroSlidePanel
                  slide={slide}
                  priority={i === 0}
                  onAction={runSlideAction}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          className={`${navBtnClass} hidden sm:flex`}
          aria-label="Próximo banner"
        >
          <IconChevron direction="right" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-3 sm:mt-3">
        <button
          type="button"
          onClick={prev}
          className={`${navBtnClass} sm:hidden`}
          aria-label="Banner anterior"
        >
          <IconChevron direction="left" />
        </button>

        <div className="flex items-center gap-1.5">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para banner ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`rounded-full transition-all ${
                i === index
                  ? "h-2 w-5 bg-sky-500"
                  : "h-2 w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className={`${navBtnClass} sm:hidden`}
          aria-label="Próximo banner"
        >
          <IconChevron direction="right" />
        </button>
      </div>
    </section>
  );
}
