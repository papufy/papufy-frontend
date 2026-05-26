export const BICO_CATEGORIES = [
  "Assistência Técnica",
  "Reformas e Reparos",
  "Serviços Domésticos",
  "Design e Tecnologia",
  "Aulas e Consultoria",
  "Eventos",
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
export type ProfessionalCategory = (typeof PROFESSIONAL_CATEGORIES)[number];
export type ListingTypeFilter = "JOB_VACANCY" | "PROFESSIONAL_PROFILE" | null;

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
    color: "bg-violet-100 text-violet-800",
    imageGradient: "from-violet-500 to-purple-700",
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
  Eletricista: {
    icon: "⚡",
    color: "bg-blue-100 text-blue-800",
    imageGradient: "from-blue-600 to-indigo-800",
  },
  Encanador: {
    icon: "🚰",
    color: "bg-cyan-100 text-cyan-800",
    imageGradient: "from-cyan-600 to-blue-700",
  },
  Pintor: {
    icon: "🎨",
    color: "bg-fuchsia-100 text-fuchsia-800",
    imageGradient: "from-fuchsia-500 to-pink-600",
  },
  Diarista: {
    icon: "🧽",
    color: "bg-emerald-100 text-emerald-800",
    imageGradient: "from-emerald-500 to-teal-700",
  },
  Designer: {
    icon: "💻",
    color: "bg-violet-100 text-violet-800",
    imageGradient: "from-violet-500 to-purple-700",
  },
  "Professor Particular": {
    icon: "📚",
    color: "bg-indigo-100 text-indigo-800",
    imageGradient: "from-indigo-500 to-blue-700",
  },
  "Outros Serviços": {
    icon: "📦",
    color: "bg-gray-100 text-gray-800",
    imageGradient: "from-gray-500 to-gray-700",
  },
};

export const SCROLL_CATEGORIES = [
  { id: "all", label: "Todos", icon: "✨", tipo: null as ListingTypeFilter },
  {
    id: "vacancy",
    label: "Vagas",
    icon: "🧰",
    tipo: "JOB_VACANCY" as const,
  },
  {
    id: "profile",
    label: "Profissionais",
    icon: "👷",
    tipo: "PROFESSIONAL_PROFILE" as const,
  },
  ...BICO_CATEGORIES.map((c) => ({
    id: `vacancy-${c}`,
    label: c.split(" ")[0],
    icon: CATEGORY_META[c]?.icon ?? "📌",
    tipo: "JOB_VACANCY" as const,
    category: c,
  })),
  ...PROFESSIONAL_CATEGORIES.slice(0, 4).map((c) => ({
    id: `profile-${c}`,
    label: c.split(" ")[0],
    icon: CATEGORY_META[c]?.icon ?? "📦",
    tipo: "PROFESSIONAL_PROFILE" as const,
    category: c,
  })),
];
