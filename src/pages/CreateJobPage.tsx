import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Camera,
  Check,
  ImagePlus,
  MapPin,
  Phone,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnunciarTipoPicker } from "../components/AnunciarTipoPicker";
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { MobileShell } from "../components/mobile/MobileShell";
import { MotionPressButton } from "../components/motion/MotionPrimitives";
import {
  BRAZIL_STATES,
  CATEGORY_META,
  JOB_VACANCY_CATEGORIES,
  PROFESSIONAL_PROFILE_CATEGORIES,
  isCustomCategoryOption,
} from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { lookupCep, normalizeCep } from "../lib/cep";
import type { ListingType } from "../types";
import { digitsOnly } from "../utils/masks";

type Step = 1 | 2 | 3;

const TITLE_EXAMPLES: Record<ListingType, string[]> = {
  JOB_VACANCY: [
    "Pia vazando no banheiro",
    "Pintura de parede",
    "Instalar ar-condicionado",
    "Limpeza pós-obra",
  ],
  PROFESSIONAL_PROFILE: [
    "Eletricista residencial",
    "Diarista e organização",
    "Pintor de interiores",
    "Aulas particulares",
  ],
};

const QUICK_PRICES = [80, 120, 200, 350, 500, 800];

type LocationState = {
  listingType?: ListingType;
  categoria?: string;
};

function parseListingType(value: string | null | undefined): ListingType | null {
  if (value === "JOB_VACANCY" || value === "PROFESSIONAL_PROFILE") return value;
  return null;
}

export function CreateJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const reduce = useReducedMotion();

  const routeState = (location.state as LocationState | null) ?? null;
  const seededType =
    parseListingType(searchParams.get("tipo")) ??
    parseListingType(routeState?.listingType);

  const [listingType, setListingType] = useState<ListingType | null>(seededType);
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const categoryOptions =
    listingType === "PROFESSIONAL_PROFILE"
      ? PROFESSIONAL_PROFILE_CATEGORIES
      : JOB_VACANCY_CATEGORIES;

  const seededCategory =
    routeState?.categoria &&
    (categoryOptions as readonly string[]).includes(routeState.categoria)
      ? routeState.categoria
      : "";

  const [categoria, setCategoria] = useState<string>(seededCategory);
  const [categoriaCustom, setCategoriaCustom] = useState("");
  const [titulo, setTitulo] = useState(
    seededType === "PROFESSIONAL_PROFILE" ? `${user?.nome ?? ""} - ` : ""
  );
  const [descricao, setDescricao] = useState("");
  const [semQualificacao, setSemQualificacao] = useState(false);
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [cidade, setCidade] = useState(user?.cidade || "Campina Grande");
  const [bairro, setBairro] = useState("");
  const [uf, setUf] = useState(user?.uf || "PB");
  const [raioAtuacao, setRaioAtuacao] = useState(
    `${user?.cidade || "Campina Grande"} e região`
  );
  const [preco, setPreco] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [imagens, setImagens] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = imagens.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagens]);

  const selectListingType = (type: ListingType) => {
    setListingType(type);
    setStep(1);
    setDirection(1);
    setShowValidation(false);
    setError(null);
    setCategoria("");
    setCategoriaCustom("");
    setTitulo(type === "PROFESSIONAL_PROFILE" ? `${user?.nome ?? ""} - ` : "");
    setSearchParams({ tipo: type }, { replace: true });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const backToTypeChoice = () => {
    setListingType(null);
    setStep(1);
    setDirection(-1);
    setShowValidation(false);
    setError(null);
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const handleBack = () => {
    if (!listingType) {
      navigate("/", { replace: true });
      return;
    }
    if (step > 1) {
      goTo((step - 1) as Step);
      return;
    }
    backToTypeChoice();
  };

  const isPro = listingType === "PROFESSIONAL_PROFILE";

  const theme = useMemo(
    () =>
      isPro
        ? {
            badge: "Ofereço",
            soft: "bg-sky-50",
            text: "text-sky-700",
            btn: "bg-sky-600 active:bg-sky-700",
            ring: "ring-sky-400",
            bar: "bg-sky-500",
            iconBg: "from-sky-500 to-blue-600",
            pageTitle: "Mostre o que você faz",
            steps: ["Área", "Perfil", "Preço"],
          }
        : {
            badge: "Procuro",
            soft: "bg-teal-50",
            text: "text-teal-700",
            btn: "bg-teal-600 active:bg-teal-700",
            ring: "ring-teal-400",
            bar: "bg-teal-500",
            iconBg: "from-teal-500 to-cyan-600",
            pageTitle: "O que você precisa?",
            steps: ["Tipo", "Detalhes", "Valor"],
          },
    [isPro]
  );

  const parsedPreco = () => {
    const raw = preco.replace(/[^\d,]/g, "").replace(",", ".");
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const parsedRange = () => {
    const min = parseFloat(precoMin.replace(/[^\d,]/g, "").replace(",", "."));
    const max = parseFloat(precoMax.replace(/[^\d,]/g, "").replace(",", "."));
    return {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 0,
    };
  };

  const resolvedCategoria = isCustomCategoryOption(categoria)
    ? categoriaCustom.trim()
    : categoria.trim();

  const getStepIssues = (s: Step): string[] => {
    if (s === 1) {
      if (!categoria) return ["Escolha uma categoria"];
      if (isCustomCategoryOption(categoria) && !categoriaCustom.trim()) {
        return ["Digite o tipo de serviço"];
      }
      if (isCustomCategoryOption(categoria) && categoriaCustom.trim().length < 2) {
        return ["Tipo de serviço muito curto"];
      }
      return [];
    }
    if (s === 2) {
      const issues: string[] = [];
      if (titulo.trim().length < 5) issues.push("Título (mín. 5 caracteres)");
      if (descricao.trim().length < 20) issues.push("Descrição (mín. 20 caracteres)");
      return issues;
    }
    const issues: string[] = [];
    if (isPro) {
      const { min, max } = parsedRange();
      if (min <= 0) issues.push("Valor mínimo");
      if (max <= 0) issues.push("Valor máximo");
      if (min > 0 && max > 0 && max < min) issues.push("Máximo ≥ mínimo");
      if (raioAtuacao.trim().length < 3) issues.push("Onde você atende");
    } else if (parsedPreco() <= 0) {
      issues.push("Orçamento estimado");
    }
    if (cidade.trim().length < 2) issues.push("Cidade");
    if (uf.trim().length !== 2) issues.push("UF");
    if (digitsOnly(telefone).length < 10) issues.push("Telefone com DDD");
    return issues;
  };

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setShowValidation(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const handleNext = () => {
    const issues = getStepIssues(step);
    if (issues.length > 0) {
      setShowValidation(true);
      setError(
        issues.length === 1
          ? `Preencha: ${issues[0]}.`
          : issues.map((i) => `• ${i}`).join("\n")
      );
      showToast(issues[0], "error");
      return;
    }
    if (step < 3) goTo((step + 1) as Step);
  };

  const handleCepChange = async (value: string) => {
    const masked = value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d{0,3})/, (_m, p1, p2) => (p2 ? `${p1}-${p2}` : p1));
    setCep(masked);
    const normalized = normalizeCep(masked);
    if (normalized.length !== 8) return;
    setCepLoading(true);
    try {
      const result = await lookupCep(normalized);
      if (!result) return;
      if (result.logradouro) setRua(result.logradouro);
      if (result.bairro) setBairro(result.bairro);
      if (result.cidade) setCidade(result.cidade);
      if (result.uf) setUf(result.uf);
    } finally {
      setCepLoading(false);
    }
  };

  const applyTitleExample = (example: string) => {
    if (isPro && user?.nome) setTitulo(`${user.nome} - ${example}`);
    else setTitulo(example);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!listingType) return;
    const issues = getStepIssues(3);
    if (issues.length > 0) {
      setShowValidation(true);
      setError(issues.map((i) => `• ${i}`).join("\n"));
      showToast(issues[0], "error");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("listingType", listingType);
      formData.append("titulo", titulo.trim());
      const { min, max } = parsedRange();
      let finalDescription = descricao.trim();
      if (isPro) {
        finalDescription += `\n\nFaixa de preço: R$ ${min.toFixed(2)} até R$ ${max.toFixed(2)}.`;
      }
      if (semQualificacao) {
        finalDescription +=
          "\n\nNão é necessária qualificação para realizar este serviço.";
      }
      formData.append("descricao", finalDescription);
      formData.append("categoria", resolvedCategoria || "Geral");
      formData.append("cep", cep.trim());
      formData.append("cidade", cidade.trim());
      formData.append("bairro", bairro.trim());
      formData.append("uf", uf);
      formData.append("telefone", telefone.trim());
      formData.append("aCombinar", "false");
      formData.append("semQualificacao", String(semQualificacao));
      if (isPro) {
        formData.append("preco", String((min + max) / 2));
        formData.append("precoMin", String(min));
        formData.append("precoMax", String(max));
        formData.append("raioAtuacao", raioAtuacao.trim());
      } else {
        formData.append("preco", String(parsedPreco()));
      }
      imagens.forEach((img) => formData.append("imagens", img));
      const { listing } = await api.listings.create(formData);
      showToast("Publicado com sucesso!", "success");
      navigate(`/anuncio/${listing.id}`, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao publicar.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const slide = {
    enter: (dir: number) =>
      reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: dir > 0 ? 24 : -24 },
    center: { opacity: 1, x: 0 },
    exit: (dir: number) =>
      reduce ? { opacity: 0, x: 0 } : { opacity: 0, x: dir > 0 ? -16 : 16 },
  };

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:text-sm";
  const inputError = (invalid: boolean) =>
    invalid
      ? "mt-1.5 w-full rounded-2xl border border-red-300 bg-white px-4 py-3.5 text-base outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 sm:text-sm"
      : inputClass;

  if (!listingType) {
    return (
      <MobileShell showCategories={false}>
        <AnunciarTipoPicker
          onSelect={selectListingType}
          onBack={() => navigate("/", { replace: true })}
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell showCategories={false}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col overflow-x-hidden bg-papufy-bg">
        {/* Top bar compacto — mobile first */}
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="touch-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 active:bg-slate-100"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-extrabold text-slate-900">
                  {theme.pageTitle}
                </h1>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isPro ? "bg-sky-100 text-sky-800" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {theme.badge}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Passo {step} de 3 · {theme.steps[step - 1]}
              </p>
            </div>
          </div>

          {/* Progresso simples */}
          <div className="flex gap-1.5 px-4 pb-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  n <= step ? theme.bar : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="w-full"
            >
              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {isPro ? "Em qual área você atua?" : "Qual tipo de serviço?"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Toque para selecionar
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {categoryOptions.map((cat) => {
                      const meta = CATEGORY_META[cat];
                      const active = categoria === cat;
                      return (
                        <MotionPressButton
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoria(cat);
                            if (!isCustomCategoryOption(cat)) {
                              setCategoriaCustom("");
                            }
                            setError(null);
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition ${
                            active
                              ? `border-transparent ${theme.soft} ring-2 ${theme.ring}`
                              : "border-slate-100 bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${
                              meta?.imageGradient
                                ? meta.imageGradient
                                : theme.iconBg
                            }`}
                          >
                            <CategoryIcon
                              name={meta?.iconKey ?? "grid"}
                              className="h-5 w-5"
                            />
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-800">
                            {cat}
                          </span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              active
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white"
                            }`}
                          >
                            {active && <Check className="h-3.5 w-3.5" />}
                          </span>
                        </MotionPressButton>
                      );
                    })}
                  </div>

                  {isCustomCategoryOption(categoria) && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                      <label
                        htmlFor="categoria-custom"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Qual serviço?
                      </label>
                      <input
                        id="categoria-custom"
                        value={categoriaCustom}
                        onChange={(e) => {
                          setCategoriaCustom(e.target.value.slice(0, 60));
                          setError(null);
                        }}
                        placeholder="Ex.: Babá, Montador de móveis, Manicure…"
                        autoFocus
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                      />
                      {showValidation && !categoriaCustom.trim() && (
                        <p className="mt-2 text-sm text-red-600">
                          Digite o tipo de serviço.
                        </p>
                      )}
                    </div>
                  )}

                  {showValidation && !categoria && (
                    <p className="text-sm text-red-600">
                      Escolha uma categoria para continuar.
                    </p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {isPro ? "Como quer ser encontrado?" : "Conte o que precisa"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Títulos claros recebem mais respostas.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Título
                    </label>
                    <input
                      value={titulo}
                      onChange={(e) => {
                        setTitulo(e.target.value);
                        setError(null);
                      }}
                      placeholder={
                        isPro
                          ? "Ex: Maria — Diarista"
                          : "Ex: Pia vazando no banheiro"
                      }
                      className={inputError(
                        showValidation && titulo.trim().length < 5
                      )}
                    />
                    <div className="-mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {TITLE_EXAMPLES[listingType].map((example) => (
                        <MotionPressButton
                          key={example}
                          type="button"
                          onClick={() => applyTitleExample(example)}
                          className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                        >
                          {example}
                        </MotionPressButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      {isPro ? "Sobre o seu trabalho" : "Descrição"}
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => {
                        setDescricao(e.target.value);
                        setError(null);
                      }}
                      rows={5}
                      placeholder={
                        isPro
                          ? "O que você oferece e seus diferenciais."
                          : "Explique o problema, urgência e detalhes."
                      }
                      className={inputError(
                        showValidation && descricao.trim().length < 20
                      )}
                    />
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          descricao.trim().length >= 20
                            ? "bg-emerald-500"
                            : theme.bar
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (descricao.trim().length / 20) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {descricao.trim().length < 20
                        ? `${descricao.trim().length}/20 · faltam ${20 - descricao.trim().length}`
                        : `${descricao.trim().length} caracteres · ótimo`}
                    </p>
                  </div>

                  <MotionPressButton
                    type="button"
                    onClick={() => setSemQualificacao((v) => !v)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left ${
                      semQualificacao
                        ? `${theme.soft} border-transparent ring-2 ${theme.ring}`
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                        semQualificacao
                          ? "bg-slate-900 text-white"
                          : "border border-slate-300 bg-white"
                      }`}
                    >
                      {semQualificacao && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Sem qualificação obrigatória
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Qualquer pessoa pode fazer, sem curso ou diploma.
                      </span>
                    </span>
                  </MotionPressButton>

                  {(titulo.trim() || descricao.trim()) && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Prévia
                      </p>
                      <p className="mt-1 text-base font-extrabold text-slate-900">
                        {titulo.trim() || "Seu título"}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                        {descricao.trim() || "A descrição aparece aqui…"}
                      </p>
                      {resolvedCategoria && (
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            isPro
                              ? "bg-sky-100 text-sky-800"
                              : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {resolvedCategoria}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {isPro ? "Preço, fotos e região" : "Orçamento, fotos e local"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Último passo — depois é só publicar.
                    </p>
                  </div>

                  <div className={`rounded-2xl ${theme.soft} p-3.5`}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <Wallet className={`h-4 w-4 ${theme.text}`} />
                      <p className="text-sm font-bold text-slate-800">
                        {isPro ? "Faixa de preço" : "Orçamento estimado"}
                      </p>
                    </div>

                    {isPro ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">
                            Mín. (R$)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            value={precoMin}
                            onChange={(e) => setPrecoMin(e.target.value)}
                            placeholder="100"
                            className={inputError(
                              showValidation && parsedRange().min <= 0
                            )}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">
                            Máx. (R$)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            value={precoMax}
                            onChange={(e) => setPrecoMax(e.target.value)}
                            placeholder="350"
                            className={inputError(
                              showValidation && parsedRange().max <= 0
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          value={preco}
                          onChange={(e) => setPreco(e.target.value)}
                          placeholder="150"
                          className={inputError(
                            showValidation && parsedPreco() <= 0
                          )}
                        />
                        <div className="-mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {QUICK_PRICES.map((value) => (
                            <MotionPressButton
                              key={value}
                              type="button"
                              onClick={() => setPreco(String(value))}
                              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                                parsedPreco() === value
                                  ? "bg-slate-900 text-white"
                                  : "bg-white text-slate-700 ring-1 ring-slate-200"
                              }`}
                            >
                              R$ {value}
                            </MotionPressButton>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="mt-2.5 text-xs text-slate-500">
                      Taxa Papufy: 7% só em pagamentos pelo app.
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Camera className={`h-4 w-4 ${theme.text}`} />
                      <p className="text-sm font-bold text-slate-800">
                        Fotos{" "}
                        <span className="font-medium text-slate-400">(opcional)</span>
                      </p>
                    </div>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-7 active:bg-slate-50">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                        <ImagePlus className="h-5 w-5 text-sky-600" />
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        Adicionar fotos
                      </span>
                      <span className="text-xs text-slate-500">Até 5 imagens</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) =>
                          setImagens(Array.from(e.target.files ?? []).slice(0, 5))
                        }
                      />
                    </label>
                    {imagePreviews.length > 0 && (
                      <div className="mt-2.5 grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, i) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() =>
                              setImagens((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="group relative aspect-square overflow-hidden rounded-xl"
                          >
                            <img
                              src={src}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <X className="h-5 w-5 text-white" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${theme.text}`} />
                      <p className="text-sm font-bold text-slate-800">Local</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">
                        CEP (opcional)
                      </label>
                      <input
                        value={cep}
                        onChange={(e) => void handleCepChange(e.target.value)}
                        placeholder="00000-000"
                        inputMode="numeric"
                        className={inputClass}
                      />
                      {cepLoading && (
                        <p className="mt-1 text-xs text-slate-400">
                          Buscando endereço…
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">
                        Rua (opcional)
                      </label>
                      <input
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-[1fr_5.5rem] gap-2.5">
                      <div>
                        <label className="text-xs font-semibold text-slate-500">
                          Cidade
                        </label>
                        <input
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className={inputError(
                            showValidation && cidade.trim().length < 2
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">
                          UF
                        </label>
                        <select
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                          className={inputClass}
                        >
                          {BRAZIL_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">
                        Bairro (opcional)
                      </label>
                      <input
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {isPro && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500">
                          Onde você atende
                        </label>
                        <input
                          value={raioAtuacao}
                          onChange={(e) => setRaioAtuacao(e.target.value)}
                          placeholder="Ex: Campina Grande e região"
                          className={inputError(
                            showValidation && raioAtuacao.trim().length < 3
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Phone className={`h-4 w-4 ${theme.text}`} />
                      <label className="text-sm font-bold text-slate-800">
                        WhatsApp / telefone
                      </label>
                    </div>
                    <input
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      inputMode="tel"
                      placeholder="(83) 99999-9999"
                      className={inputError(
                        showValidation && digitsOnly(telefone).length < 10
                      )}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      {isPro
                        ? "Clientes usam este contato para te contratar."
                        : "Profissionais veem ao demonstrar interesse."}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="mt-4 rounded-2xl bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error.split("\n").map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      className={index > 0 ? "mt-1" : undefined}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA fixo acima da safe area */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg gap-2.5 px-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 min-w-[5.5rem] flex-1 rounded-2xl text-sm"
              onClick={handleBack}
            >
              Voltar
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                className={`h-12 flex-[1.6] rounded-2xl text-sm text-white ${theme.btn}`}
                onClick={handleNext}
              >
                Continuar
              </Button>
            ) : (
              <Button
                type="button"
                className={`h-12 flex-[1.6] rounded-2xl text-sm text-white ${theme.btn}`}
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Publicando…" : "Publicar"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
