import { useMemo, useState } from "react";
import type { ListingImage } from "../types";
import { getCategoryMeta } from "../constants/categories";

interface ListingImageGalleryProps {
  titulo: string;
  categoria: string;
  imagemCapa?: string | null;
  imagens?: ListingImage[];
}

/** Largura máxima da galeria (~75% do container principal), centralizada. */
const GALLERY_WRAP =
  "mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0";

/** Mosaico estilo OLX: esquerda alta | centro largo | direita 2 quadrados empilhados */
const MOSAIC_GRID =
  "grid grid-cols-[1fr_1.5fr_1fr] grid-rows-2 gap-1";

const MOSAIC_HEIGHT =
  "h-[min(68vw,260px)] sm:h-[min(50vw,360px)] lg:h-[min(42vw,420px)]";

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
      className={`relative overflow-hidden rounded-sm bg-slate-100 ${className ?? ""}`}
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

function GalleryPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-sm bg-slate-100 ${className ?? ""}`}
      aria-hidden
    />
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

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const extraCount = slides.length > 4 ? slides.length - 4 : 0;

  const slotClass = {
    left: "col-start-1 row-span-2 row-start-1 h-full min-h-0",
    center: "col-start-2 row-span-2 row-start-1 h-full min-h-0",
    rightTop: "col-start-3 row-span-1 row-start-1 h-full min-h-0",
    rightBottom: "col-start-3 row-span-1 row-start-2 h-full min-h-0",
  };

  const renderSlot = (
    index: number,
    className: string,
    overlay?: string
  ) => {
    const src = slides[index];
    if (!src) {
      return <GalleryPlaceholder className={className} />;
    }

    return (
      <GalleryTile
        src={src}
        alt={`${titulo} — foto ${index + 1}`}
        className={className}
        overlay={overlay}
        onClick={() => openLightbox(index)}
      />
    );
  };

  const renderMosaic = () => (
    <div className={`${MOSAIC_GRID} ${MOSAIC_HEIGHT}`}>
      {renderSlot(0, slotClass.left)}
      {renderSlot(1, slotClass.center)}
      {renderSlot(2, slotClass.rightTop)}
      {renderSlot(
        3,
        slotClass.rightBottom,
        extraCount > 0 ? `+${extraCount}` : undefined
      )}
    </div>
  );

  if (slides.length === 0) {
    return (
      <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
        <div className={`${MOSAIC_GRID} ${MOSAIC_HEIGHT}`}>
          <div
            className={`${slotClass.left} flex items-center justify-center bg-gradient-to-br ${meta.imageGradient}`}
          >
            <span className="text-5xl sm:text-6xl lg:text-7xl">{meta.icon}</span>
          </div>
          <GalleryPlaceholder className={slotClass.center} />
          <GalleryPlaceholder className={slotClass.rightTop} />
          <GalleryPlaceholder className={slotClass.rightBottom} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
        {renderMosaic()}
      </div>

      {slides.length > 1 && (
        <div
          className={`${GALLERY_WRAP} mt-2 flex justify-center gap-2 overflow-x-auto pb-1`}
        >
          {slides.map((url, index) => (
            <button
              key={`${url}-thumb-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className="aspect-[4/3] h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-md border border-slate-200 sm:h-20 sm:w-28"
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
