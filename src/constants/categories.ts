export const BICO_CATEGORIES = [
  "Assistência Técnica",
  "Reformas e Reparos",
  "Serviços Domésticos",
  "Design e Tecnologia",
  "Aulas e Consultoria",
  "Eventos",
] as const;

export const PRODUCT_CATEGORIES = [
  "Eletrônicos",
  "Móveis e Decoração",
  "Veículos",
  "Moda e Beleza",
  "Esportes",
  "Casa e Jardim",
  "Outros",
] as const;

export const PROFESSIONAL_CATEGORIES = [
  "Eletricista",
  "Encanador",
  "Pintor",
  "Diarista",
  "Designer",
  "Professor Particular",
  "Outros Serviços",
] as const;

export const JOB_CATEGORIES = BICO_CATEGORIES;

export type JobCategory = (typeof BICO_CATEGORIES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ListingTypeFilter =
  | "JOB_VACANCY"
  | "PROFESSIONAL_PROFILE"
  | "BICO"
  | "PRODUTO"
  | null;

export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const CATEGORY_META: Record<
  string,
  { icon: string; color: string; imageGradient: string }
> = {
  "Assistência Técnica": {
    icon: "🔧",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-500 to-sky-700",
  },
  "Reformas e Reparos": {
    icon: "🏗️",
    color: "bg-amber-100 text-amber-800",
    imageGradient: "from-amber-500 to-orange-600",
  },
  "Serviços Domésticos": {
    icon: "🧹",
    color: "bg-emerald-100 text-emerald-800",
    imageGradient: "from-emerald-500 to-teal-600",
  },
  "Design e Tecnologia": {
    icon: "💻",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-400 to-blue-600",
  },
  "Aulas e Consultoria": {
    icon: "📚",
    color: "bg-indigo-100 text-indigo-800",
    imageGradient: "from-indigo-500 to-blue-700",
  },
  Eventos: {
    icon: "🎉",
    color: "bg-pink-100 text-pink-800",
    imageGradient: "from-pink-500 to-rose-600",
  },
  Eletrônicos: {
    icon: "📱",
    color: "bg-slate-100 text-slate-800",
    imageGradient: "from-slate-600 to-slate-800",
  },
  "Móveis e Decoração": {
    icon: "🛋️",
    color: "bg-orange-100 text-orange-800",
    imageGradient: "from-orange-500 to-amber-700",
  },
  Veículos: {
    icon: "🚗",
    color: "bg-blue-100 text-blue-800",
    imageGradient: "from-blue-600 to-indigo-800",
  },
  "Moda e Beleza": {
    icon: "👗",
    color: "bg-fuchsia-100 text-fuchsia-800",
    imageGradient: "from-fuchsia-500 to-pink-600",
  },
  Esportes: {
    icon: "⚽",
    color: "bg-lime-100 text-lime-800",
    imageGradient: "from-lime-600 to-green-700",
  },
  "Casa e Jardim": {
    icon: "🌿",
    color: "bg-green-100 text-green-800",
    imageGradient: "from-green-500 to-emerald-700",
  },
  Outros: {
    icon: "📦",
    color: "bg-gray-100 text-gray-800",
    imageGradient: "from-gray-500 to-gray-700",
  },
};

export const SCROLL_CATEGORIES = [
  { id: "all", label: "Todos", icon: "✨", tipo: null as ListingTypeFilter },
  {
    id: "bico",
    label: "Pedidos",
    icon: "🛠️",
    tipo: "JOB_VACANCY" as const,
  },
  {
    id: "pro",
    label: "Profissionais",
    icon: "👷",
    tipo: "PROFESSIONAL_PROFILE" as const,
  },
  ...BICO_CATEGORIES.map((c) => ({
    id: `bico-${c}`,
    label: c.split(" ")[0],
    icon: CATEGORY_META[c]?.icon ?? "📌",
    tipo: "JOB_VACANCY" as const,
    category: c,
  })),
  ...PROFESSIONAL_CATEGORIES.slice(0, 4).map((c) => ({
    id: `pro-${c}`,
    label: c.split(" ")[0],
    icon: CATEGORY_META[c]?.icon ?? "👷",
    tipo: "PROFESSIONAL_PROFILE" as const,
    category: c,
  })),
];
