import { useMemo, useState } from "react";
import type { ListingImage } from "../types";
import { getCategoryMeta } from "../constants/categories";

interface ListingImageGalleryProps {
  titulo: string;
  categoria: string;
  imagemCapa?: string | null;
  imagens?: ListingImage[];
}

const GALLERY_WRAP =
  "mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0";

const MOSAIC_HEIGHT =
  "h-[min(68vw,260px)] sm:h-[min(50vw,360px)] lg:h-[min(42vw,420px)]";

function useSlides(imagemCapa?: string | null, imagens: ListingImage[] = []) {
  return useMemo(() => {
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
}

function GalleryImage({
  src,
  alt,
  className = "",
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}
        aria-hidden
      >
        Imagem indisponível
      </div>
    );
  }

  const img = (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  if (!onClick) {
    return <div className={`overflow-hidden ${className}`}>{img}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block overflow-hidden bg-slate-100 ${className}`}
      aria-label={alt}
    >
      {img}
    </button>
  );
}

function EmptyGallery({
  categoria,
}: {
  categoria: string;
}) {
  const meta = getCategoryMeta(categoria);
  return (
    <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
      <div
        className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${meta.imageGradient}`}
      >
        <span className="text-5xl sm:text-6xl lg:text-7xl">{meta.icon}</span>
      </div>
    </div>
  );
}

function SingleImageGallery({
  src,
  titulo,
  onOpen,
}: {
  src: string;
  titulo: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
      <GalleryImage
        src={src}
        alt={titulo}
        className="aspect-[4/3] w-full rounded-lg"
        onClick={() => onOpen(0)}
      />
    </div>
  );
}

function DualImageGallery({
  slides,
  titulo,
  onOpen,
}: {
  slides: string[];
  titulo: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
      <div className={`grid grid-cols-2 gap-1 ${MOSAIC_HEIGHT} overflow-hidden rounded-lg`}>
        {slides.slice(0, 2).map((src, index) => (
          <GalleryImage
            key={`${src}-${index}`}
            src={src}
            alt={`${titulo} — foto ${index + 1}`}
            className="h-full min-h-0 w-full"
            onClick={() => onOpen(index)}
          />
        ))}
      </div>
    </div>
  );
}

function TripleImageGallery({
  slides,
  titulo,
  onOpen,
}: {
  slides: string[];
  titulo: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
      <div
        className={`grid grid-cols-[1fr_1.5fr_1fr] grid-rows-2 gap-1 ${MOSAIC_HEIGHT} overflow-hidden rounded-lg`}
      >
        <GalleryImage
          src={slides[1]}
          alt={`${titulo} — foto 2`}
          className="col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full"
          onClick={() => onOpen(1)}
        />
        <GalleryImage
          src={slides[0]}
          alt={`${titulo} — foto 1`}
          className="col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full"
          onClick={() => onOpen(0)}
        />
        <GalleryImage
          src={slides[2]}
          alt={`${titulo} — foto 3`}
          className="col-start-3 row-start-1 row-span-1 h-full min-h-0 w-full"
          onClick={() => onOpen(2)}
        />
        <div className="col-start-3 row-start-2 bg-slate-100" aria-hidden />
      </div>
    </div>
  );
}

function MosaicGallery({
  slides,
  titulo,
  onOpen,
}: {
  slides: string[];
  titulo: string;
  onOpen: (index: number) => void;
}) {
  const extraCount = slides.length > 4 ? slides.length - 4 : 0;

  return (
    <div className={`${GALLERY_WRAP} py-3 sm:py-4`}>
      <div
        className={`grid grid-cols-[1fr_1.5fr_1fr] grid-rows-2 gap-1 ${MOSAIC_HEIGHT} overflow-hidden rounded-lg`}
      >
        <GalleryImage
          src={slides[1]}
          alt={`${titulo} — foto 2`}
          className="col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full"
          onClick={() => onOpen(1)}
        />
        <GalleryImage
          src={slides[0]}
          alt={`${titulo} — foto 1`}
          className="col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full"
          onClick={() => onOpen(0)}
        />
        <GalleryImage
          src={slides[2]}
          alt={`${titulo} — foto 3`}
          className="col-start-3 row-start-1 h-full min-h-0 w-full"
          onClick={() => onOpen(2)}
        />
        {slides[3] ? (
          <div className="relative col-start-3 row-start-2 h-full min-h-0 w-full">
            <GalleryImage
              src={slides[3]}
              alt={`${titulo} — foto 4`}
              className="h-full w-full"
              onClick={() => onOpen(3)}
            />
            {extraCount > 0 && (
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-bold text-white"
                onClick={() => onOpen(3)}
                aria-label={`Ver mais ${extraCount} fotos`}
              >
                +{extraCount}
              </button>
            )}
          </div>
        ) : (
          <div className="col-start-3 row-start-2 bg-slate-100" aria-hidden />
        )}
      </div>
    </div>
  );
}

function ThumbnailStrip({
  slides,
  titulo,
  onOpen,
}: {
  slides: string[];
  titulo: string;
  onOpen: (index: number) => void;
}) {
  if (slides.length <= 1) return null;

  return (
    <div
      className={`${GALLERY_WRAP} mt-2 flex justify-center gap-2 overflow-x-auto pb-1`}
    >
      {slides.map((url, index) => (
        <button
          key={`${url}-thumb-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className="aspect-[4/3] h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-md border border-slate-200 sm:h-20 sm:w-28"
          aria-label={`Ver foto ${index + 1} de ${titulo}`}
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
  );
}

function Lightbox({
  slides,
  titulo,
  index,
  onClose,
  onChange,
}: {
  slides: string[];
  titulo: string;
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white"
        onClick={onClose}
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
              onChange((index - 1 + slides.length) % slides.length);
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
              onChange((index + 1) % slides.length);
            }}
            aria-label="Próxima foto"
          >
            ›
          </button>
        </>
      )}
      <img
        src={slides[index]}
        alt={titulo}
        className="max-h-[85vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="absolute bottom-6 text-sm text-white/80">
        {index + 1} / {slides.length}
      </span>
    </div>
  );
}

export function ListingImageGallery({
  titulo,
  categoria,
  imagemCapa,
  imagens = [],
}: ListingImageGalleryProps) {
  const slides = useSlides(imagemCapa, imagens);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  if (slides.length === 0) {
    return <EmptyGallery categoria={categoria} />;
  }

  const renderMain = () => {
    if (slides.length === 1) {
      return (
        <SingleImageGallery
          src={slides[0]}
          titulo={titulo}
          onOpen={openLightbox}
        />
      );
    }
    if (slides.length === 2) {
      return (
        <DualImageGallery slides={slides} titulo={titulo} onOpen={openLightbox} />
      );
    }
    if (slides.length === 3) {
      return (
        <TripleImageGallery slides={slides} titulo={titulo} onOpen={openLightbox} />
      );
    }
    return (
      <MosaicGallery slides={slides} titulo={titulo} onOpen={openLightbox} />
    );
  };

  return (
    <>
      {renderMain()}
      <ThumbnailStrip slides={slides} titulo={titulo} onOpen={openLightbox} />
      {lightboxIndex !== null && (
        <Lightbox
          slides={slides}
          titulo={titulo}
          index={lightboxIndex}
          onClose={closeLightbox}
          onChange={setLightboxIndex}
        />
      )}
    </>
  );
}
