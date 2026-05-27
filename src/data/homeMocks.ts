/**
 * Banners do carrossel hero (PNG/JPEG/WebP/SVG em /public).
 * Tamanho recomendado: 1576×300 px — bordas podem ser cortadas em telas estreitas;
 * mantenha texto e CTA na faixa central (~60% da largura).
 */
export type HeroSlideAction =
  | { type: "filter"; category: string }
  | {
      type: "anunciar";
      listingType: "JOB_VACANCY" | "PROFESSIONAL_PROFILE";
    };

export interface HeroSlide {
  id: string;
  /** Caminho em /public (ex.: /slide1.png) */
  src: string;
  alt: string;
  action?: HeroSlideAction;
}

export const HERO_BANNER_WIDTH = 1576;
export const HERO_BANNER_HEIGHT = 300;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    src: "/slide1.png",
    alt: "Papufy — destaque 1",
    action: { type: "filter", category: "Reformas e Reparos" },
  },
  {
    id: "slide-3",
    src: "/slide3.png",
    alt: "Papufy — destaque 3",
    action: { type: "anunciar", listingType: "PROFESSIONAL_PROFILE" },
  },
  {
    id: "slide-4",
    src: "/slide4.png",
    alt: "Papufy — destaque 4",
  },
];
