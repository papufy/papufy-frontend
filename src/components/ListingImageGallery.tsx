import { useMemo, useState } from "react";
import type { ListingImage } from "../types";
import { getCategoryMeta } from "../constants/categories";

interface ListingImageGalleryProps {
  titulo: string;
  categoria: string;
  imagemCapa?: string | null;
  imagens?: ListingImage[];
}

function GalleryTile({
  src,
  alt,
  className,
  overlay,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-100 ${className ?? ""}`}
      aria-label={alt}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      {overlay && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-bold text-white">
          {overlay}
        </span>
      )}
    </button>
  );
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

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (slides.length === 0) {
    return (
      <div
        className={`flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br ${meta.imageGradient}`}
      >
        <span className="text-6xl sm:text-7xl">{meta.icon}</span>
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const mosaicHeight =
    "h-[min(72vw,280px)] sm:h-[min(52vw,380px)] lg:h-[min(40vw,440px)]";

  const renderMosaic = () => {
    if (slides.length === 1) {
      return (
        <GalleryTile
          src={slides[0]}
          alt={titulo}
          className="aspect-[4/3] w-full"
          onClick={() => openLightbox(0)}
        />
      );
    }

    if (slides.length === 2) {
      return (
        <div className={`grid grid-cols-2 gap-1 ${mosaicHeight}`}>
          {slides.map((src, index) => (
            <GalleryTile
              key={`${src}-${index}`}
              src={src}
              alt={`${titulo} — foto ${index + 1}`}
              className="h-full min-h-0"
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      );
    }

    if (slides.length === 3) {
      return (
        <div className={`grid grid-cols-3 grid-rows-2 gap-1 ${mosaicHeight}`}>
          <GalleryTile
            src={slides[0]}
            alt={`${titulo} — foto 1`}
            className="col-span-1 row-span-2 h-full min-h-0"
            onClick={() => openLightbox(0)}
          />
          <GalleryTile
            src={slides[1]}
            alt={`${titulo} — foto 2`}
            className="col-span-1 row-span-2 h-full min-h-0"
            onClick={() => openLightbox(1)}
          />
          <GalleryTile
            src={slides[2]}
            alt={`${titulo} — foto 3`}
            className="col-span-1 row-span-2 h-full min-h-0"
            onClick={() => openLightbox(2)}
          />
        </div>
      );
    }

    const extraCount = slides.length > 4 ? slides.length - 4 : 0;

    return (
      <div className={`grid grid-cols-3 grid-rows-2 gap-1 ${mosaicHeight}`}>
        <GalleryTile
          src={slides[0]}
          alt={`${titulo} — foto 1`}
          className="col-span-1 row-span-2 h-full min-h-0"
          onClick={() => openLightbox(0)}
        />
        <GalleryTile
          src={slides[1]}
          alt={`${titulo} — foto 2`}
          className="col-span-1 row-span-2 h-full min-h-0"
          onClick={() => openLightbox(1)}
        />
        <GalleryTile
          src={slides[2]}
          alt={`${titulo} — foto 3`}
          className="col-span-1 row-span-1 h-full min-h-0"
          onClick={() => openLightbox(2)}
        />
        <GalleryTile
          src={slides[3] ?? slides[2]}
          alt={`${titulo} — foto 4`}
          className="col-span-1 row-span-1 h-full min-h-0"
          overlay={extraCount > 0 ? `+${extraCount}` : undefined}
          onClick={() => openLightbox(3)}
        />
      </div>
    );
  };

  return (
    <>
      <div className="w-full overflow-hidden bg-white">{renderMosaic()}</div>

      {slides.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {slides.map((url, index) => (
            <button
              key={`${url}-thumb-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className="aspect-[4/3] h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-md border border-slate-200 sm:h-20 sm:w-28"
              aria-label={`Ver foto ${index + 1}`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white"
            onClick={closeLightbox}
          >
            Fechar
          </button>
          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i === null ? 0 : (i - 1 + slides.length) % slides.length
                  );
                }}
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i === null ? 0 : (i + 1) % slides.length
                  );
                }}
                aria-label="Próxima foto"
              >
                ›
              </button>
            </>
          )}
          <img
            src={slides[lightboxIndex]}
            alt={titulo}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-6 text-sm text-white/80">
            {lightboxIndex + 1} / {slides.length}
          </span>
        </div>
      )}
    </>
  );
}
