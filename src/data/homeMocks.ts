export interface HeroSlide {
  id: string;
  variant: "purple-promo" | "blue-pro" | "lime-category";
}

export interface MockRecentJob {
  id: string;
  imageEmoji: string;
  imageGradient: string;
  categoryTag: string;
  tagClassName: string;
  title: string;
  price: string;
  location: string;
  dateLabel: string;
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
  { id: "slide-1", variant: "purple-promo" },
  { id: "slide-2", variant: "blue-pro" },
  { id: "slide-3", variant: "lime-category" },
];

export const MOCK_RECENT_JOBS: MockRecentJob[] = [
  {
    id: "job-1",
    imageEmoji: "🔧",
    imageGradient: "from-slate-600 via-slate-700 to-slate-900",
    categoryTag: "REFORMAS",
    tagClassName: "bg-amber-500 text-white",
    title: "Conserto de Vazamento de Pia",
    price: "R$ 150",
    location: "Campina Grande, PB",
    dateLabel: "Há 10 min",
  },
  {
    id: "job-2",
    imageEmoji: "💻",
    imageGradient: "from-indigo-500 via-violet-600 to-purple-900",
    categoryTag: "TECH",
    tagClassName: "bg-violet-600 text-white",
    title: "Criação de Logo Simples",
    price: "A combinar",
    location: "Campina Grande, PB",
    dateLabel: "Há 25 min",
  },
  {
    id: "job-3",
    imageEmoji: "🎨",
    imageGradient: "from-orange-400 via-red-500 to-red-800",
    categoryTag: "REFORMAS",
    tagClassName: "bg-amber-500 text-white",
    title: "Pintura de Quarto 12m²",
    price: "R$ 320",
    location: "Malvinas, PB",
    dateLabel: "Há 1 h",
  },
  {
    id: "job-4",
    imageEmoji: "🧹",
    imageGradient: "from-emerald-500 via-teal-600 to-teal-900",
    categoryTag: "DOMÉSTICOS",
    tagClassName: "bg-emerald-600 text-white",
    title: "Limpeza Pesada Pós-Obra",
    price: "R$ 280",
    location: "Centro, PB",
    dateLabel: "Há 2 h",
  },
];

export const MOCK_FEATURED_PROFESSIONALS: MockFeaturedProfessional[] = [
  {
    id: "pro-1",
    name: "João E.",
    avatarGradient: "from-sky-300 to-papufy-blue",
    avatarEmoji: "👨‍🔧",
    badge: "MELHOR AVALIADO ⭐",
    specialty: "Eletricista Residencial",
    verified: true,
  },
  {
    id: "pro-2",
    name: "Ana M.",
    avatarGradient: "from-pink-300 to-violet-500",
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
