import { useRef, useState } from "react";
import type { JobCategory } from "../constants/categories";
import { CATEGORY_META } from "../constants/categories";

interface JobImageGalleryProps {
  categoria: string;
  titulo: string;
}

export function JobImageGallery({ categoria, titulo }: JobImageGalleryProps) {
  const meta =
    CATEGORY_META[categoria as JobCategory] ??
    CATEGORY_META["Serviços Domésticos"];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slides = [0, 1, 2, 3, 4];

  const scrollToSlide = (i: number) => {
    setActiveIndex(i);
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile: carrossel em tela cheia */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          className="snap-x-mandatory flex overflow-x-auto scroll-smooth rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Fotos do anúncio"
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth || 1;
            const i = Math.round(el.scrollLeft / w);
            if (i !== activeIndex && i >= 0 && i < slides.length) {
              setActiveIndex(i);
            }
          }}
        >
          {slides.map((i) => (
            <div
              key={i}
              className={`relative aspect-[4/3] w-full shrink-0 snap-center snap-always overflow-hidden rounded-xl bg-gradient-to-br ${meta.imageGradient}`}
              onClick={() => scrollToSlide(i)}
            >
              <div className="flex h-full flex-col items-center justify-center p-6">
                <span className="text-6xl drop-shadow-md">{meta.icon}</span>
                {i === 0 && (
                  <p className="mt-3 line-clamp-2 text-center text-sm font-medium text-white/90">
                    {titulo}
                  </p>
                )}
                {i === 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <span className="text-2xl font-bold text-white">+3</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">
          {slides.map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => scrollToSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === i
                  ? "w-5 bg-papufy-orange"
                  : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: grade bento */}
      <div className="hidden h-[min(420px,50vh)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl lg:grid">
        <div
          className={`col-span-2 row-span-2 flex items-center justify-center rounded-lg bg-gradient-to-br ${meta.imageGradient} p-6`}
        >
          <div className="text-center">
            <span className="text-8xl drop-shadow-md">{meta.icon}</span>
            <p className="mt-3 line-clamp-2 text-sm font-medium text-white/90">
              {titulo}
            </p>
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${meta.imageGradient} opacity-90`}
          >
            <span className="text-3xl opacity-80">{meta.icon}</span>
          </div>
        ))}
        <div
          className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br ${meta.imageGradient} opacity-90`}
        >
          <span className="text-3xl opacity-80">{meta.icon}</span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-2xl font-bold text-white">+3</span>
          </div>
        </div>
      </div>
    </>
  );
}
