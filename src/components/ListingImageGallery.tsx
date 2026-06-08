import { useMemo, useState } from "react";
import type { ListingImage } from "../types";
import { getCategoryMeta } from "../constants/categories";

interface ListingImageGalleryProps {
  titulo: string;
  categoria: string;
  imagemCapa?: string | null;
  imagens?: ListingImage[];
}

export function ListingImageGallery({
  titulo,
  categoria,
  imagemCapa,
  imagens = [],
}: ListingImageGalleryProps) {
  const meta = getCategoryMeta(categoria);

  const slides = useMemo(() => {
    const sorted = [...imagens].sort((a, b) => a.ordem - b.ordem);
    const urls = sorted
      .map((img) => img.url)
      .filter((url) => url && !url.includes("placeholders/"));
    if (urls.length > 0) return urls;
    if (imagemCapa && !imagemCapa.includes("placeholders/")) {
      return [imagemCapa];
    }
    return [];
  }, [imagens, imagemCapa]);

  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) {
    return (
      <div
        className={`flex aspect-[5/3] max-h-48 items-center justify-center rounded-xl bg-gradient-to-br sm:max-h-52 ${meta.imageGradient}`}
      >
        <span className="text-5xl sm:text-6xl">{meta.icon}</span>
      </div>
    );
  }

  const activeUrl = slides[Math.min(activeIndex, slides.length - 1)];

  return (
    <div className="space-y-2">
      <div className="relative mx-auto aspect-[5/3] max-h-48 w-full overflow-hidden rounded-xl bg-slate-100 sm:max-h-52">
        <img
          src={activeUrl}
          alt={titulo}
          className="h-full w-full object-cover"
          loading="eager"
        />
        {slides.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
            {activeIndex + 1}/{slides.length}
          </span>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {slides.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === activeIndex
                  ? "border-sky-500 ring-1 ring-sky-200"
                  : "border-slate-200 opacity-80"
              }`}
              aria-label={`Ver foto ${index + 1}`}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
