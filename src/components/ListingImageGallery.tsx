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

/** Mosaico estilo OLX: esquerda alta | centro largo (foto principal) | direita 2 quadrados */
const MOSAIC_GRID =
  "grid w-full grid-cols-[1fr_1.5fr_1fr] grid-rows-2 gap-1";

const MOSAIC_HEIGHT =
  "h-[min(68vw,260px)] sm:h-[min(50vw,360px)] lg:h-[min(42vw,420px)]";

const SLOT_CLASS = {
  left: "col-start-1 row-start-1 row-span-2 min-h-0",
  center: "col-start-2 row-start-1 row-span-2 min-h-0",
  rightTop: "col-start-3 row-start-1 row-span-1 min-h-0",
  rightBottom: "col-start-3 row-start-2 row-span-1 min-h-0",
} as const;

/** Capa no centro; demais fotos nos outros slots (ordem OLX). */
const SLOT_SLIDE_INDEX = {
  left: 1,
  center: 0,
  rightTop: 2,
  rightBottom: 3,
} as const;

type MosaicSlot = keyof typeof SLOT_CLASS;

function GalleryTile({
  src,
  alt,
  slotClass,
  overlay,
  onClick,
}: {
  src: string;
  alt: string;
  slotClass: string;
  overlay?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative block h-full w-full min-h-0 overflow-hidden rounded-sm bg-slate-100 ${slotClass}`}
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {overlay && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 text-lg font-bold text-white">
          {overlay}
        </span>
      )}
    </button>
  );
}

function GalleryPlaceholder({ slotClass }: { slotClass: string }) {
  return (
    <div
      className={`h-full w-full min-h-0 rounded-sm bg-slate-100 ${slotClass}`}
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

  const renderSlot = (slot: MosaicSlot) => {
    const slideIndex = SLOT_SLIDE_INDEX[slot];
    const src = slides[slideIndex];
    const slotClass = SLOT_CLASS[slot];
    const overlay =
      slot === "rightBottom" && extraCount > 0 ? `+${extraCount}` : undefined;

    if (!src) {
      return <GalleryPlaceholder slotClass={slotClass} />;
    }

    return (
      <GalleryTile
        src={src}
        alt={`${titulo} — foto ${slideIndex + 1}`}
        slotClass={slotClass}
        overlay={overlay}
        onClick={() => openLightbox(slideIndex)}
      />
    );
  };

  const renderMosaic = () => (
    <div className={`${MOSAIC_GRID} ${MOSAIC_HEIGHT}`}>
      {renderSlot("left")}
      {renderSlot("center")}
      {renderSlot("rightTop")}
      {renderSlot("rightBottom")}
    </div>
  );

  if (slides.length === 0) {
    return (
      <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
        <div className={`${MOSAIC_GRID} ${MOSAIC_HEIGHT}`}>
          <div
            className={`${SLOT_CLASS.center} flex h-full w-full items-center justify-center bg-gradient-to-br ${meta.imageGradient}`}
          >
            <span className="text-5xl sm:text-6xl lg:text-7xl">{meta.icon}</span>
          </div>
          <GalleryPlaceholder slotClass={SLOT_CLASS.left} />
          <GalleryPlaceholder slotClass={SLOT_CLASS.rightTop} />
          <GalleryPlaceholder slotClass={SLOT_CLASS.rightBottom} />
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
