import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { CategoryIcon } from "../components/icons/CategoryIcons";
import { MobileShell } from "../components/mobile/MobileShell";
import { MotionEnter, MotionPressButton } from "../components/motion/MotionPrimitives";
import {
  BRAZIL_STATES,
  CATEGORY_META,
  JOB_VACANCY_CATEGORIES,
  PROFESSIONAL_PROFILE_CATEGORIES,
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
    "Pintura de parede danificada",
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

export function CreateJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const reduce = useReducedMotion();

  const routeState = (location.state as LocationState | null) ?? null;
  const initialType = routeState?.listingType;

  useEffect(() => {
    if (!initialType) {
      navigate("/anunciar/tipo", { replace: true });
    }
  }, [initialType, navigate]);

  const [listingType] = useState<ListingType>(initialType ?? "JOB_VACANCY");
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
  const [titulo, setTitulo] = useState(
    listingType === "PROFESSIONAL_PROFILE" ? `${user?.nome ?? ""} - ` : ""
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

  const isPro = listingType === "PROFESSIONAL_PROFILE";

  const theme = useMemo(
    () =>
      isPro
        ? {
            badge: "Ofereço serviço",
            badgeClass: "bg-sky-100 text-sky-800",
            accent: "sky",
            headerFrom: "from-sky-500",
            headerTo: "to-blue-700",
            ring: "ring-sky-400",
            soft: "bg-sky-50",
            text: "text-sky-700",
            btn: "bg-sky-600 hover:bg-sky-700",
            pageTitle: "Mostre o que você faz",
            steps: ["Área", "Perfil", "Preço e local"],
          }
        : {
            badge: "Procuro serviço",
            badgeClass: "bg-teal-100 text-teal-800",
            accent: "teal",
            headerFrom: "from-teal-500",
            headerTo: "to-cyan-700",
            ring: "ring-teal-400",
            soft: "bg-teal-50",
            text: "text-teal-700",
            btn: "bg-teal-600 hover:bg-teal-700",
            pageTitle: "O que você precisa?",
            steps: ["Categoria", "Detalhes", "Orçamento"],
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

  const getStepIssues = (s: Step): string[] => {
    if (s === 1) {
      return categoria ? [] : ["Escolha uma categoria"];
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
  };

  const handleNext = () => {
    const issues = getStepIssues(step);
    if (issues.length > 0) {
      setShowValidation(true);
      setError(issues.length === 1 ? `Preencha: ${issues[0]}.` : issues.map((i) => `• ${i}`).join("\n"));
      showToast(issues[0], "error");
      return;
    }
    if (step < 3) goTo(((step + 1) as Step));
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
      formData.append("categoria", categoria.trim() || "Geral");
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
      reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: dir > 0 ? 40 : -40 },
    center: { opacity: 1, x: 0 },
    exit: (dir: number) =>
      reduce ? { opacity: 0, x: 0 } : { opacity: 0, x: dir > 0 ? -28 : 28 },
  };

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
  const inputError = (invalid: boolean) =>
    invalid
      ? "mt-1.5 w-full rounded-2xl border border-red-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
      : inputClass;

  if (!initialType) return null;

  return (
    <MobileShell showCategories={false}>
      <div className="relative min-h-[calc(100dvh-8rem)] pb-24">
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${theme.headerFrom} ${theme.headerTo} px-4 pb-10 pt-5 text-white`}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-8 h-24 w-24 rounded-full bg-white/10 blur-xl"
            aria-hidden
          />
          <div className="page-container relative !px-0">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/anunciar/tipo"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Trocar tipo
              </Link>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${theme.badgeClass}`}>
                {theme.badge}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {theme.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Passo {step} de 3 · {theme.steps[step - 1]}
            </p>

            <div className="mt-5 flex gap-2">
              {theme.steps.map((label, i) => {
                const n = (i + 1) as Step;
                const done = step > n;
                const active = step === n;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (n < step) goTo(n);
                    }}
                    className={`flex min-w-0 flex-1 flex-col items-start gap-1.5 rounded-2xl px-2.5 py-2 text-left transition ${
                      active
                        ? "bg-white/20"
                        : done
                          ? "bg-white/10"
                          : "bg-white/5"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        done || active
                          ? "bg-white text-slate-800"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : n}
                    </span>
                    <span className="truncate text-[11px] font-semibold text-white/90">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="page-container relative -mt-5">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="p-4 sm:p-6"
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <MotionEnter>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {isPro ? "Em qual área você atua?" : "Qual tipo de serviço?"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Toque em um card. Dá pra mudar depois.
                      </p>
                    </MotionEnter>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {categoryOptions.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        const active = categoria === cat;
                        return (
                          <MotionPressButton
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategoria(cat);
                              setError(null);
                            }}
                            className={`relative overflow-hidden rounded-2xl border-2 p-3 text-left transition ${
                              active
                                ? `border-transparent ${theme.ring} ring-2 shadow-md`
                                : "border-slate-100 bg-slate-50/80 hover:border-slate-200"
                            }`}
                          >
                            <div
                              className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${
                                meta?.imageGradient
                                  ? `bg-gradient-to-br ${meta.imageGradient}`
                                  : `${theme.headerFrom} ${theme.headerTo}`
                              }`}
                            >
                              <CategoryIcon
                                name={meta?.iconKey ?? "grid"}
                                className="h-5 w-5"
                              />
                            </div>
                            <span className="block text-sm font-bold leading-snug text-slate-800">
                              {cat}
                            </span>
                            {active && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </MotionPressButton>
                        );
                      })}
                    </div>
                    {showValidation && !categoria && (
                      <p className="text-sm text-red-600">Escolha uma categoria para continuar.</p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {isPro ? "Como quer ser encontrado?" : "Conte o que precisa"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Títulos claros recebem bem mais respostas.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">Título</label>
                      <input
                        value={titulo}
                        onChange={(e) => {
                          setTitulo(e.target.value);
                          setError(null);
                        }}
                        placeholder={
                          isPro
                            ? "Ex: Maria — Diarista e organização"
                            : "Ex: Pia vazando no banheiro"
                        }
                        className={inputError(
                          showValidation && titulo.trim().length < 5
                        )}
                      />
                      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {TITLE_EXAMPLES[listingType].map((example) => (
                          <MotionPressButton
                            key={example}
                            type="button"
                            onClick={() => applyTitleExample(example)}
                            className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
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
                            ? "Conte o que você oferece, experiência e diferenciais."
                            : "Explique o problema, urgência e detalhes úteis."
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
                              : "bg-sky-400"
                          }`}
                          style={{
                            width: `${Math.min(100, (descricao.trim().length / 20) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {descricao.trim().length} caracteres
                        {descricao.trim().length < 20
                          ? ` · faltam ${20 - descricao.trim().length}`
                          : " · ótimo"}
                      </p>
                    </div>

                    <MotionPressButton
                      type="button"
                      onClick={() => setSemQualificacao((v) => !v)}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
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
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Prévia do anúncio
                        </p>
                        <p className="mt-1 text-base font-extrabold text-slate-900">
                          {titulo.trim() || "Seu título aparece aqui"}
                        </p>
                        <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                          {descricao.trim() || "A descrição aparece aqui…"}
                        </p>
                        {categoria && (
                          <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${theme.badgeClass}`}>
                            {categoria}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {isPro ? "Preço, fotos e região" : "Orçamento, fotos e local"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Último passo — depois é só publicar.
                      </p>
                    </div>

                    <div className={`rounded-2xl ${theme.soft} p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <Wallet className={`h-4 w-4 ${theme.text}`} />
                        <p className="text-sm font-bold text-slate-800">
                          {isPro ? "Faixa de preço" : "Orçamento estimado"}
                        </p>
                      </div>

                      {isPro ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold text-slate-500">
                              Mínimo (R$)
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
                              Máximo (R$)
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
                          <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_PRICES.map((value) => (
                              <MotionPressButton
                                key={value}
                                type="button"
                                onClick={() => setPreco(String(value))}
                                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
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
                      <p className="mt-3 text-xs text-slate-500">
                        Papufy cobra 7% só em pagamentos pelo app.
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Camera className={`h-4 w-4 ${theme.text}`} />
                        <p className="text-sm font-bold text-slate-800">
                          Fotos <span className="font-medium text-slate-400">(opcional)</span>
                        </p>
                      </div>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 transition hover:border-sky-300 hover:bg-sky-50/40">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                          <ImagePlus className="h-6 w-6 text-sky-600" />
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          Adicionar fotos
                        </span>
                        <span className="text-xs text-slate-500">
                          Até 5 imagens · ajuda a receber mais respostas
                        </span>
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
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
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
                              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                                <X className="h-5 w-5 text-white" />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
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
                      <div className="grid gap-3 sm:grid-cols-2">
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
                        inputMode="numeric"
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
                      <p key={`${line}-${index}`} className={index > 0 ? "mt-1" : undefined}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="page-container flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => goTo(((step - 1) as Step))}
            >
              Voltar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => navigate("/anunciar/tipo")}
            >
              Tipo
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              className={`h-12 flex-[1.4] rounded-2xl text-white ${theme.btn}`}
              onClick={handleNext}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="button"
              className={`h-12 flex-[1.4] rounded-2xl text-white ${theme.btn}`}
              disabled={submitting}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Publicando…" : "Publicar agora"}
            </Button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
