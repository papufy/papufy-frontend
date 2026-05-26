import { useState } from "react";
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
  const slides = [0, 1, 2, 3, 4];

  return (
    <>
      {/* Mobile: carrossel em tela cheia */}
      <div className="lg:hidden">
        <div
          className="snap-x-mandatory flex gap-2 overflow-x-auto rounded-xl"
          role="region"
          aria-label="Fotos do anúncio"
        >
          {slides.map((i) => (
            <div
              key={i}
              className={`relative aspect-[4/3] w-[88vw] max-w-full shrink-0 snap-start overflow-hidden rounded-xl bg-gradient-to-br sm:w-[85vw] ${meta.imageGradient}`}
              onClick={() => setActiveIndex(i)}
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
              onClick={() => setActiveIndex(i)}
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
