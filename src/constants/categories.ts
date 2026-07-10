import type { CategoryIconKey } from "../components/icons/CategoryIcons";

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
  {
    icon: string;
    iconKey: CategoryIconKey;
    color: string;
    imageGradient: string;
  }
> = {
  "Assistência Técnica": {
    icon: "🔧",
    iconKey: "wrench",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-500 to-sky-700",
  },
  "Reformas e Reparos": {
    icon: "🏗️",
    iconKey: "crane",
    color: "bg-amber-100 text-amber-800",
    imageGradient: "from-amber-500 to-orange-600",
  },
  "Serviços Domésticos": {
    icon: "🧹",
    iconKey: "broom",
    color: "bg-emerald-100 text-emerald-800",
    imageGradient: "from-emerald-500 to-teal-600",
  },
  "Design e Tecnologia": {
    icon: "💻",
    iconKey: "monitor",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-400 to-blue-600",
  },
  "Aulas e Consultoria": {
    icon: "📚",
    iconKey: "book",
    color: "bg-indigo-100 text-indigo-800",
    imageGradient: "from-indigo-500 to-blue-700",
  },
  Eventos: {
    icon: "🎉",
    iconKey: "party",
    color: "bg-pink-100 text-pink-800",
    imageGradient: "from-pink-500 to-rose-600",
  },
  Eletricista: {
    icon: "⚡",
    iconKey: "wrench",
    color: "bg-amber-100 text-amber-800",
    imageGradient: "from-amber-500 to-orange-600",
  },
  Encanador: {
    icon: "🔩",
    iconKey: "wrench",
    color: "bg-blue-100 text-blue-800",
    imageGradient: "from-blue-500 to-indigo-600",
  },
  Pintor: {
    icon: "🎨",
    iconKey: "crane",
    color: "bg-violet-100 text-violet-800",
    imageGradient: "from-violet-500 to-purple-600",
  },
  Diarista: {
    icon: "🧹",
    iconKey: "broom",
    color: "bg-emerald-100 text-emerald-800",
    imageGradient: "from-emerald-500 to-teal-600",
  },
  Designer: {
    icon: "✏️",
    iconKey: "monitor",
    color: "bg-sky-100 text-sky-800",
    imageGradient: "from-sky-400 to-blue-600",
  },
  "Professor Particular": {
    icon: "📖",
    iconKey: "book",
    color: "bg-indigo-100 text-indigo-800",
    imageGradient: "from-indigo-500 to-blue-700",
  },
  "Outros Serviços": {
    icon: "📦",
    iconKey: "box",
    color: "bg-gray-100 text-gray-800",
    imageGradient: "from-gray-500 to-gray-700",
  },
  /** Legado (anúncios antigos no banco) */
  Outros: {
    icon: "📦",
    iconKey: "box",
    color: "bg-gray-100 text-gray-800",
    imageGradient: "from-gray-500 to-gray-700",
  },
  Eletrônicos: {
    icon: "📱",
    iconKey: "phone",
    color: "bg-slate-100 text-slate-800",
    imageGradient: "from-slate-600 to-slate-800",
  },
  "Móveis e Decoração": {
    icon: "🛋️",
    iconKey: "sofa",
    color: "bg-orange-100 text-orange-800",
    imageGradient: "from-orange-500 to-amber-700",
  },
  Veículos: {
    icon: "🚗",
    iconKey: "car",
    color: "bg-blue-100 text-blue-800",
    imageGradient: "from-blue-600 to-indigo-800",
  },
  "Moda e Beleza": {
    icon: "👗",
    iconKey: "shirt",
    color: "bg-fuchsia-100 text-fuchsia-800",
    imageGradient: "from-fuchsia-500 to-pink-600",
  },
  Esportes: {
    icon: "⚽",
    iconKey: "ball",
    color: "bg-lime-100 text-lime-800",
    imageGradient: "from-lime-600 to-green-700",
  },
  "Casa e Jardim": {
    icon: "🌿",
    iconKey: "plant",
    color: "bg-green-100 text-green-800",
    imageGradient: "from-green-500 to-emerald-700",
  },
};

export type CategoryMeta = (typeof CATEGORY_META)[string];

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  icon: "📦",
  iconKey: "box",
  color: "bg-gray-100 text-gray-800",
  imageGradient: "from-gray-500 to-gray-700",
};

export function getCategoryMeta(categoria: string): CategoryMeta {
  return CATEGORY_META[categoria] ?? DEFAULT_CATEGORY_META;
}

/** Macro-categorias do carrossel da home */
export const MACRO_SCROLL_CATEGORIES = [
  {
    id: "all",
    label: "Todos",
    icon: "✨",
    iconKey: "sparkles" as CategoryIconKey,
    listingType: null as ListingTypeFilter,
    category: null as string | null,
  },
  {
    id: "pedidos",
    label: "Pedidos",
    icon: "📋",
    iconKey: "clipboard" as CategoryIconKey,
    listingType: "JOB_VACANCY" as const,
    category: null as string | null,
  },
  {
    id: "profissionais",
    label: "Profissionais",
    icon: "👷",
    iconKey: "briefcase" as CategoryIconKey,
    listingType: "PROFESSIONAL_PROFILE" as const,
    category: null as string | null,
  },
  {
    id: "assistencia",
    label: "Assistência",
    icon: "🔧",
    iconKey: "wrench" as CategoryIconKey,
    listingType: null as ListingTypeFilter,
    category: "Assistência Técnica",
  },
  {
    id: "reformas",
    label: "Reformas",
    icon: "🏗️",
    iconKey: "crane" as CategoryIconKey,
    listingType: null as ListingTypeFilter,
    category: "Reformas e Reparos",
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: "🧹",
    iconKey: "broom" as CategoryIconKey,
    listingType: null as ListingTypeFilter,
    category: "Serviços Domésticos",
  },
] as const;

/** @deprecated Use MACRO_SCROLL_CATEGORIES */
export const SCROLL_CATEGORIES = MACRO_SCROLL_CATEGORIES;
