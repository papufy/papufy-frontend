import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { HERO_SLIDES, type HeroSlide } from "../../data/homeMocks";
import { QrCodePlaceholder } from "./QrCodePlaceholder";

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
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Slide 1 — gradiente azul claro vibrante (identidade Papufy) */
function SkyPromoSlide() {
  return (
    <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 px-3 pb-10 pt-3 shadow-lg shadow-sky-200/50 sm:min-h-[220px] sm:px-4">
      <p className="text-center text-sm font-extrabold leading-tight text-white sm:text-base">
        Papufy: Sua grana extra rápida.
      </p>

      <div className="relative mt-2 flex flex-1 items-stretch gap-1 sm:mt-3">
        <div className="flex w-[28%] shrink-0 flex-col justify-between py-1">
          <span className="text-lg font-black tracking-tight text-white sm:text-xl">
            Papufy
          </span>
          <p className="text-[9px] font-bold uppercase text-sky-100 sm:text-[10px]">
            Sua marca
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-1.5">
          <div className="flex max-w-[32%] flex-1 flex-col rounded-xl bg-white px-2 py-2 shadow-md sm:px-2.5 sm:py-2.5">
            <p className="text-[8px] font-bold uppercase text-sky-600 sm:text-[9px]">
              Crie 3 anúncios
            </p>
            <p className="mt-1 text-[10px] font-extrabold leading-tight text-slate-800 sm:text-xs">
              Faça 1 bico hoje.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center text-white">
            <span className="text-xl font-black sm:text-2xl">→</span>
          </div>

          <div className="flex max-w-[32%] flex-1 flex-col rounded-xl bg-white px-2 py-2 shadow-md sm:px-2.5 sm:py-2.5">
            <p className="text-[8px] font-bold uppercase text-sky-600 sm:text-[9px]">
              Ganhe 3 destaques
            </p>
            <p className="mt-1 text-[10px] font-extrabold leading-tight text-slate-800 sm:text-xs">
              Receba seu Pix na hora.
            </p>
          </div>
        </div>

        <div className="flex w-[26%] shrink-0 flex-col items-center justify-between py-0.5">
          <div className="relative text-center">
            <span className="text-2xl sm:text-3xl" aria-hidden>
              🪙
            </span>
            <p className="mt-0.5 text-[9px] font-bold text-amber-200 sm:text-[10px]">
              Aproveite!
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-0.5 text-[10px] font-black text-white">Papufy</p>
            <QrCodePlaceholder className="scale-90 sm:scale-100" />
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-white sm:text-[9px]">
              Baixe o App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlueProSlide() {
  return (
    <div className="relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 px-4 py-5 shadow-lg shadow-sky-200/40 sm:min-h-[220px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-50">
            Papufy Pro
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-white sm:text-xl">
            Torne-se um Profissional Destaque
          </h3>
          <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-sky-50/95">
            Mais visibilidade, mais contatos e avaliações que geram confiança.
          </p>
        </div>
        <div className="flex gap-1 text-2xl sm:text-3xl" aria-hidden>
          <span>🔨</span>
          <span>⚡</span>
          <span>🧰</span>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 w-fit rounded-full bg-white px-4 py-2 text-xs font-bold text-sky-700 active:scale-95"
      >
        Quero ser destaque
      </button>
    </div>
  );
}

function SkyCategorySlide() {
  return (
    <div className="relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-sky-200 to-blue-300 px-4 py-5 sm:min-h-[220px]">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
          Categorias mais buscadas
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-tight text-slate-800 sm:text-xl">
          Reformas perto de você
        </h3>
        <p className="mt-2 text-xs text-slate-600">
          Encanadores, pintores e pedreiros disponíveis agora.
        </p>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="flex gap-2 text-3xl sm:text-4xl" aria-hidden>
          <span>🏠</span>
          <span>🪣</span>
          <span>🖌️</span>
        </div>
        <span className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-sky-700 shadow-sm">
          Ver reformas
        </span>
      </div>
    </div>
  );
}

function SlideContent({ variant }: { variant: HeroSlide["variant"] }) {
  if (variant === "sky-promo") return <SkyPromoSlide />;
  if (variant === "blue-pro") return <BlueProSlide />;
  return <SkyCategorySlide />;
}

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const paused = useRef(false);
  const total = HERO_SLIDES.length;

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

  return (
    <section
      className="relative w-full select-none"
      aria-roledescription="carousel"
      aria-label="Promoções Papufy"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="w-full shrink-0">
              <SlideContent variant={slide.variant} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-1 top-[42%] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sky-600 shadow-md active:scale-95 sm:left-2 sm:h-9 sm:w-9"
        aria-label="Slide anterior"
      >
        <IconChevron direction="left" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-1 top-[42%] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sky-600 shadow-md active:scale-95 sm:right-2 sm:h-9 sm:w-9"
        aria-label="Próximo slide"
      >
        <IconChevron direction="right" />
      </button>

      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1.5">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all ${
                i === index
                  ? "h-2 w-5 bg-sky-500 shadow-sm"
                  : "h-2 w-2 bg-white/90"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
