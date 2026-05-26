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
      className="h-4 w-4"
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

function PurplePromoSlide() {
  return (
    <div className="relative flex min-h-[228px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c12e8] via-[#6e0ad6] to-[#4a05a8] px-4 pb-11 pt-4 shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35) 0%, transparent 45%)",
        }}
      />

      <h3 className="relative z-10 text-center text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-base">
        Papufy: Sua grana extra rápida.
      </h3>

      <div className="relative z-10 mt-3 flex flex-1 items-stretch gap-2">
        <div className="flex w-[22%] shrink-0 flex-col justify-start pt-1">
          <img
            src="/nome.png"
            alt="Papufy"
            className="h-auto w-full max-w-[72px] object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          <div className="flex min-w-0 flex-1 flex-col rounded-xl bg-white px-2.5 py-2.5 shadow-md">
            <p className="text-[8px] font-bold uppercase tracking-wide text-papufy-purple">
              Crie 3 anúncios
            </p>
            <p className="mt-1 text-[11px] font-extrabold leading-tight text-papufy-purple">
              Faça 1 serviço hoje.
            </p>
          </div>

          <span className="shrink-0 text-xl font-black text-white/95" aria-hidden>
            →
          </span>

          <div className="flex min-w-0 flex-1 flex-col rounded-xl bg-white px-2.5 py-2.5 shadow-md">
            <p className="text-[8px] font-bold uppercase tracking-wide text-papufy-purple">
              Ganhe 3 destaques
            </p>
            <p className="mt-1 text-[11px] font-extrabold leading-tight text-papufy-purple">
              Receba seu Pix na hora.
            </p>
          </div>
        </div>

        <div className="relative flex w-[24%] shrink-0 flex-col items-center justify-between">
          <div className="relative w-full text-center">
            <span
              className="absolute -left-1 top-0 text-2xl drop-shadow-lg"
              aria-hidden
            >
              🪙
            </span>
            <span
              className="absolute right-0 top-2 text-xl drop-shadow-lg"
              aria-hidden
            >
              💰
            </span>
            <span
              className="absolute left-1/2 top-6 -translate-x-1/2 text-lg"
              aria-hidden
            >
              ✨
            </span>
            <p className="relative z-10 mt-10 text-[10px] font-extrabold text-yellow-300 drop-shadow">
              Aproveite!
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/nome.png"
              alt=""
              aria-hidden
              className="mb-1 h-4 w-auto object-contain brightness-0 invert"
            />
            <QrCodePlaceholder />
            <p className="mt-1.5 text-[8px] font-bold uppercase tracking-wider text-white">
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
    <div className="relative flex min-h-[228px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b9bd5] to-[#2d6a9f] px-5 py-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/75">
            Papufy Pro
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-white">
            Torne-se um Profissional Destaque
          </h3>
          <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-white/90">
            Mais visibilidade, mais contatos e avaliações que geram confiança.
          </p>
        </div>
        <div className="flex shrink-0 gap-1 text-2xl" aria-hidden>
          <span>🔨</span>
          <span>⚡</span>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 w-fit rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#2d6a9f] shadow-md active:scale-95"
      >
        Quero ser destaque
      </button>
    </div>
  );
}

function LimeCategorySlide() {
  return (
    <div className="relative flex min-h-[228px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#c5e86c] to-[#6b9f1e] px-5 py-5 shadow-lg">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d5016]/80">
          Categorias mais buscadas
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-tight text-[#1a3309]">
          Reformas perto de você
        </h3>
        <p className="mt-2 text-xs text-[#2d5016]/90">
          Encanadores, pintores e pedreiros disponíveis agora.
        </p>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex gap-2 text-3xl" aria-hidden>
          <span>🏠</span>
          <span>🪣</span>
          <span>🖌️</span>
        </div>
        <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#2d5016] shadow-sm">
          Ver reformas
        </span>
      </div>
    </div>
  );
}

function SlideContent({ variant }: { variant: HeroSlide["variant"] }) {
  if (variant === "purple-promo") return <PurplePromoSlide />;
  if (variant === "blue-pro") return <BlueProSlide />;
  return <LimeCategorySlide />;
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
        className="absolute left-0 top-[45%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-papufy-purple shadow-lg active:scale-95"
        aria-label="Slide anterior"
      >
        <IconChevron direction="left" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-[45%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-papufy-purple shadow-lg active:scale-95"
        aria-label="Próximo slide"
      >
        <IconChevron direction="right" />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`rounded-full transition-all ${
                i === index
                  ? "h-2.5 w-2.5 bg-papufy-orange shadow-sm ring-2 ring-white/50"
                  : "h-2 w-2 bg-white/85"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
