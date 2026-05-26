export interface HeroSlide {
  id: string;
  variant: "sky-promo" | "blue-pro" | "sky-category";
}

export interface MockRecentJob {
  id: string;
  imageEmoji: string;
  imageGradient: string;
  categoryTag: string;
  tagClassName: string;
  title: string;
  price: string;
  locationLine: string;
}

export interface MockFeaturedProfessional {
  id: string;
  name: string;
  avatarGradient: string;
  avatarEmoji: string;
  badge: string;
  specialty: string;
  verified: boolean;
}

export const HERO_SLIDES: HeroSlide[] = [
  { id: "slide-1", variant: "sky-promo" },
  { id: "slide-2", variant: "blue-pro" },
  { id: "slide-3", variant: "sky-category" },
];

export const MOCK_RECENT_JOBS: MockRecentJob[] = [
  {
    id: "job-1",
    imageEmoji: "🔧",
    imageGradient: "from-sky-500 to-blue-700",
    categoryTag: "REFORMAS",
    tagClassName: "bg-amber-500 text-white",
    title: "Conserto de Vazamento de Pia",
    price: "R$ 150",
    locationLine: "Campina Grande, PB · Há 10 min",
  },
  {
    id: "job-2",
    imageEmoji: "💻",
    imageGradient: "from-sky-400 to-blue-600",
    categoryTag: "TECH",
    tagClassName: "bg-sky-600 text-white",
    title: "Criação de Logo Simples",
    price: "A combinar",
    locationLine: "Campina Grande, PB · Há 25 min",
  },
  {
    id: "job-3",
    imageEmoji: "🎨",
    imageGradient: "from-orange-400 to-red-600",
    categoryTag: "REFORMAS",
    tagClassName: "bg-amber-500 text-white",
    title: "Pintura de Quarto 12m²",
    price: "R$ 320",
    locationLine: "Malvinas, PB · Há 1 h",
  },
  {
    id: "job-4",
    imageEmoji: "🧹",
    imageGradient: "from-emerald-500 to-teal-700",
    categoryTag: "DOMÉSTICOS",
    tagClassName: "bg-emerald-600 text-white",
    title: "Limpeza Pesada Pós-Obra",
    price: "R$ 280",
    locationLine: "Centro, PB · Há 2 h",
  },
];

export const MOCK_FEATURED_PROFESSIONALS: MockFeaturedProfessional[] = [
  {
    id: "pro-1",
    name: "João E.",
    avatarGradient: "from-sky-300 to-papufy-orange",
    avatarEmoji: "👨‍🔧",
    badge: "MELHOR AVALIADO ⭐",
    specialty: "Eletricista Residencial",
    verified: true,
  },
  {
    id: "pro-2",
    name: "Ana M.",
    avatarGradient: "from-sky-300 to-blue-500",
    avatarEmoji: "👩‍💻",
    badge: "DESTAQUE TECH",
    specialty: "Designer & Social Media",
    verified: true,
  },
  {
    id: "pro-3",
    name: "Carlos R.",
    avatarGradient: "from-amber-300 to-orange-500",
    avatarEmoji: "👷",
    badge: "TOP REFORMAS",
    specialty: "Pedreiro & Acabamento",
    verified: true,
  },
  {
    id: "pro-4",
    name: "Beatriz L.",
    avatarGradient: "from-lime-300 to-green-600",
    avatarEmoji: "👩‍🏫",
    badge: "SUPER PROFESSORA",
    specialty: "Aulas de Inglês",
    verified: false,
  },
];
