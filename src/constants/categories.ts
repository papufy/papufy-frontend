/** Categorias para pedidos de serviço (JOB_VACANCY) */
export const JOB_VACANCY_CATEGORIES = [
  "Assistência Técnica",
  "Reformas e Reparos",
  "Serviços Domésticos",
  "Design e Tecnologia",
  "Aulas e Consultoria",
  "Eventos",
] as const;

/** Categorias para perfil profissional (PROFESSIONAL_PROFILE) */
export const PROFESSIONAL_PROFILE_CATEGORIES = [
  "Eletricista",
  "Encanador",
  "Pintor",
  "Diarista",
  "Designer",
  "Professor Particular",
  "Outros Serviços",
] as const;

export type JobVacancyCategory = (typeof JOB_VACANCY_CATEGORIES)[number];
export type ProfessionalProfileCategory =
  (typeof PROFESSIONAL_PROFILE_CATEGORIES)[number];

/** @deprecated use JobVacancyCategory */
export type JobCategory = JobVacancyCategory;

export type ListingTypeFilter =
  | "JOB_VACANCY"
  | "PROFESSIONAL_PROFILE"
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
  Eletricista: {
    icon: "⚡",
    color: "bg-amber-100 text-amber-800",
    imageGradient: "from-amber-500 to-orange-600",
  },
  Encanador: {
    icon: "🔩",
    color: "bg-blue-100 text-blue-800",
    imageGradient: "from-blue-500 to-indigo-600",
  },
  Pintor: {
    icon: "🎨",
    color: "bg-violet-100 text-violet-800",
    imageGradient: "from-violet-500 to-purple-600",
  },
  Diarista: {
    icon: "🧹",
    color: "bg-emerald-100 text-emerald-800",
    imageGradient: "from-emerald-500 to-teal-600",
  },
  Designer: {
    icon: "✏️",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-400 to-blue-600",
  },
  "Professor Particular": {
    icon: "📖",
    color: "bg-indigo-100 text-indigo-800",
    imageGradient: "from-indigo-500 to-blue-700",
  },
  "Outros Serviços": {
    icon: "📦",
    color: "bg-gray-100 text-gray-800",
    imageGradient: "from-gray-500 to-gray-700",
  },
};

/** Macro-categorias do carrossel da home */
export const MACRO_SCROLL_CATEGORIES = [
  {
    id: "all",
    label: "Todos",
    icon: "✨",
    listingType: null as ListingTypeFilter,
    category: null as string | null,
  },
  {
    id: "pedidos",
    label: "Pedidos",
    icon: "📋",
    listingType: "JOB_VACANCY" as const,
    category: null as string | null,
  },
  {
    id: "profissionais",
    label: "Profissionais",
    icon: "👷",
    listingType: "PROFESSIONAL_PROFILE" as const,
    category: null as string | null,
  },
  {
    id: "assistencia",
    label: "Assistência",
    icon: "🔧",
    listingType: null as ListingTypeFilter,
    category: "Assistência Técnica",
  },
  {
    id: "reformas",
    label: "Reformas",
    icon: "🏗️",
    listingType: null as ListingTypeFilter,
    category: "Reformas e Reparos",
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: "🧹",
    listingType: null as ListingTypeFilter,
    category: "Serviços Domésticos",
  },
] as const;

/** @deprecated Use MACRO_SCROLL_CATEGORIES */
export const SCROLL_CATEGORIES = MACRO_SCROLL_CATEGORIES;
