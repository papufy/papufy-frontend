import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { BRAZIL_STATES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { lookupCep, normalizeCep } from "../lib/cep";
import type { ListingType } from "../types";
import { digitsOnly } from "../utils/masks";

type Step = 1 | 2;

export function CreateJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const initialType = (location.state as { listingType?: ListingType } | null)
    ?.listingType;
  const [listingType] = useState<ListingType>(initialType ?? "JOB_VACANCY");

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

  const labels = useMemo(() => {
    if (listingType === "JOB_VACANCY") {
      return {
        pageTitle: "Publicar pedido de serviço",
        subtitle: "Em 2 passos simples você recebe propostas.",
        step1Title: "Valores e fotos",
        step2Title: "Sobre o serviço",
        titleLabel: "Título do que você precisa",
        titlePlaceholder: "Ex: Pia vazando no banheiro",
        descLabel: "Descreva o problema ou serviço",
        descPlaceholder:
          "Explique o que precisa, urgência e qualquer detalhe útil.",
        moneyLabel: "Orçamento estimado (R$)",
        moneyPlaceholder: "150",
        phoneHint:
          "Profissionais verão seu contato ao demonstrar interesse.",
        submitLabel: "Publicar serviço",
      };
    }
    return {
      pageTitle: "Anunciar seu trabalho",
      subtitle: "Em 2 passos simples você aparece para novos clientes.",
      step1Title: "Valores e fotos",
      step2Title: "Sobre seus serviços",
      titleLabel: "Como você quer ser encontrado?",
      titlePlaceholder: "Ex: Maria — Diarista e organização",
      descLabel: "O que você faz e sua experiência",
      descPlaceholder:
        "Conte o que você oferece, onde atende e seus diferenciais.",
      moneyLabel: "Faixa de preço (R$)",
      moneyPlaceholder: "200",
      phoneHint: "Clientes usarão este contato para contratar você.",
      submitLabel: "Publicar anúncio",
    };
  }, [listingType]);

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

  const getStep1Issues = (): string[] => {
    const issues: string[] = [];
    if (listingType === "PROFESSIONAL_PROFILE") {
      const { min, max } = parsedRange();
      if (min <= 0) issues.push("Valor mínimo (R$)");
      if (max <= 0) issues.push("Valor máximo (R$)");
      if (min > 0 && max > 0 && max < min) {
        issues.push("Valor máximo deve ser maior ou igual ao mínimo");
      }
    } else if (parsedPreco() <= 0) {
      issues.push("Orçamento estimado (R$)");
    }
    return issues;
  };

  const getStep2Issues = (): string[] => {
    const issues: string[] = [];
    if (titulo.trim().length < 5) {
      issues.push("Título (mínimo 5 caracteres)");
    }
    if (descricao.trim().length < 20) {
      issues.push("Descrição (mínimo 20 caracteres)");
    }
    if (cidade.trim().length < 2) {
      issues.push("Cidade");
    }
    if (uf.trim().length !== 2) {
      issues.push("UF");
    }
    if (digitsOnly(telefone).length < 10) {
      issues.push("Telefone/WhatsApp com DDD (mínimo 10 dígitos)");
    }
    if (
      listingType === "PROFESSIONAL_PROFILE" &&
      raioAtuacao.trim().length < 3
    ) {
      issues.push("Onde você atende");
    }
    return issues;
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-sky-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const formatMissingFieldsMessage = (issues: string[]) =>
    issues.length === 1
      ? `Preencha: ${issues[0]}.`
      : `Preencha os campos obrigatórios:\n${issues.map((item) => `• ${item}`).join("\n")}`;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "mt-1 w-full rounded-lg border border-red-300 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : inputClass;

  const handleNext = () => {
    const issues = getStep1Issues();
    if (issues.length > 0) {
      setShowValidation(true);
      const msg = formatMissingFieldsMessage(issues);
      setError(msg);
      showToast(issues[0], "error");
      return;
    }
    setError(null);
    setShowValidation(false);
    setStep(2);
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

  const handleSubmit = async () => {
    const issues = getStep2Issues();
    if (issues.length > 0) {
      setShowValidation(true);
      const msg = formatMissingFieldsMessage(issues);
      setError(msg);
      showToast(issues[0], "error");
      return;
    }

    setError(null);
    setShowValidation(false);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("listingType", listingType);
      formData.append("titulo", titulo.trim());

      const { min, max } = parsedRange();
      let finalDescription = descricao.trim();
      if (listingType === "PROFESSIONAL_PROFILE") {
        finalDescription += `\n\nFaixa de preço: R$ ${min.toFixed(2)} até R$ ${max.toFixed(2)}.`;
      }
      if (semQualificacao) {
        finalDescription +=
          "\n\nNão é necessária qualificação para realizar este serviço.";
      }
      formData.append("descricao", finalDescription);
      formData.append("categoria", "Geral");
      formData.append("cep", cep.trim());
      formData.append("cidade", cidade.trim());
      formData.append("bairro", bairro.trim());
      formData.append("uf", uf);
      formData.append("telefone", telefone.trim());
      formData.append("aCombinar", "false");

      if (listingType === "PROFESSIONAL_PROFILE") {
        formData.append("preco", String((min + max) / 2));
        formData.append("raioAtuacao", raioAtuacao.trim());
      } else {
        formData.append("preco", String(parsedPreco()));
      }

      formData.append("semQualificacao", String(semQualificacao));

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

  return (
    <MobileShell showCategories={false}>
      <div className="page-container mx-auto max-w-2xl py-5">
        <h1 className="text-2xl font-extrabold text-papufy-text">
          {labels.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-papufy-muted">
          Etapa {step} de 2 — {labels.subtitle}
        </p>

        <div className="mt-6 flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-sky-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-papufy-border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-papufy-text">{labels.step1Title}</h2>

              {listingType === "PROFESSIONAL_PROFILE" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Valor mínimo (R$)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={precoMin}
                      onChange={(e) => {
                        setPrecoMin(e.target.value);
                        setError(null);
                      }}
                      placeholder="100"
                      className={inputErrorClass(
                        showValidation && parsedRange().min <= 0
                      )}
                    />
                    {showValidation && parsedRange().min <= 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        Informe o valor mínimo.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor máximo (R$)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={precoMax}
                      onChange={(e) => {
                        setPrecoMax(e.target.value);
                        setError(null);
                      }}
                      placeholder="350"
                      className={inputErrorClass(
                        showValidation && parsedRange().max <= 0
                      )}
                    />
                    {showValidation && parsedRange().max <= 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        Informe o valor máximo.
                      </p>
                    )}
                  </div>
                  {showValidation &&
                    parsedRange().max > 0 &&
                    parsedRange().min > 0 &&
                    parsedRange().max < parsedRange().min && (
                      <p className="text-xs text-red-600 sm:col-span-2">
                        O valor máximo deve ser maior ou igual ao mínimo.
                      </p>
                    )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">{labels.moneyLabel}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={preco}
                    onChange={(e) => {
                      setPreco(e.target.value);
                      setError(null);
                    }}
                    placeholder={labels.moneyPlaceholder}
                    className={inputErrorClass(
                      showValidation && parsedPreco() <= 0
                    )}
                  />
                  {showValidation && parsedPreco() <= 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      Informe o orçamento estimado.
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-papufy-muted">
                Papufy cobra 7% apenas em pagamentos feitos pelo app.
              </p>

              <div>
                <label className="text-sm font-medium">Fotos (opcional, até 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImagens(Array.from(e.target.files ?? []).slice(0, 5))
                  }
                  className="mt-1 w-full rounded-lg border border-dashed border-sky-200 px-4 py-3 text-sm"
                />
                {imagens.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imagens.map((img, i) => (
                      <button
                        key={`${img.name}-${i}`}
                        type="button"
                        onClick={() =>
                          setImagens((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                      >
                        {img.name.slice(0, 18)} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-papufy-text">{labels.step2Title}</h2>

              <div>
                <label className="text-sm font-medium">{labels.titleLabel}</label>
                <input
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setError(null);
                  }}
                  placeholder={labels.titlePlaceholder}
                  className={inputErrorClass(
                    showValidation && titulo.trim().length < 5
                  )}
                />
                {showValidation && titulo.trim().length < 5 && (
                  <p className="mt-1 text-xs text-red-600">
                    O título precisa ter pelo menos 5 caracteres.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">{labels.descLabel}</label>
                <textarea
                  value={descricao}
                  onChange={(e) => {
                    setDescricao(e.target.value);
                    setError(null);
                  }}
                  rows={5}
                  placeholder={labels.descPlaceholder}
                  className={inputErrorClass(
                    showValidation && descricao.trim().length < 20
                  )}
                />
                {showValidation && descricao.trim().length < 20 && (
                  <p className="mt-1 text-xs text-red-600">
                    A descrição precisa ter pelo menos 20 caracteres.
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={semQualificacao}
                  onChange={(e) => setSemQualificacao(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Não é necessária qualificação
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    Marque se qualquer pessoa pode fazer este serviço, sem curso,
                    diploma ou experiência específica.
                  </span>
                </span>
              </label>

              <div className="border-t border-papufy-border pt-4">
                <h3 className="text-sm font-semibold text-papufy-text">
                  Onde e como falar com você
                </h3>
              </div>

              <div>
                <label className="text-sm font-medium">CEP (opcional)</label>
                <input
                  value={cep}
                  onChange={(e) => void handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  inputMode="numeric"
                  className={inputClass}
                />
                {cepLoading && (
                  <p className="mt-1 text-xs text-papufy-muted">
                    Buscando endereço pelo CEP...
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Rua (opcional)</label>
                <input
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Logradouro"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <input
                    value={cidade}
                    onChange={(e) => {
                      setCidade(e.target.value);
                      setError(null);
                    }}
                    className={inputErrorClass(
                      showValidation && cidade.trim().length < 2
                    )}
                  />
                  {showValidation && cidade.trim().length < 2 && (
                    <p className="mt-1 text-xs text-red-600">Informe a cidade.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">UF</label>
                  <select
                    value={uf}
                    onChange={(e) => {
                      setUf(e.target.value);
                      setError(null);
                    }}
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

              {listingType === "PROFESSIONAL_PROFILE" && (
                <div>
                  <label className="text-sm font-medium">Onde você atende</label>
                  <input
                    value={raioAtuacao}
                    onChange={(e) => {
                      setRaioAtuacao(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ex: Campina Grande e região"
                    className={inputErrorClass(
                      showValidation && raioAtuacao.trim().length < 3
                    )}
                  />
                  {showValidation && raioAtuacao.trim().length < 3 && (
                    <p className="mt-1 text-xs text-red-600">
                      Informe onde você atende.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Bairro (opcional)</label>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telefone / WhatsApp</label>
                <input
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value);
                    setError(null);
                  }}
                  inputMode="numeric"
                  placeholder="(83) 99999-9999"
                  className={inputErrorClass(
                    showValidation && digitsOnly(telefone).length < 10
                  )}
                />
                {showValidation && digitsOnly(telefone).length < 10 ? (
                  <p className="mt-1 text-xs text-red-600">
                    Informe um telefone válido com DDD.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-papufy-muted">{labels.phoneHint}</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error.split("\n").map((line, index) => (
                <p key={`${line}-${index}`} className={index > 0 ? "mt-1" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          )}

          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] -mx-4 mt-6 flex gap-3 border-t border-papufy-border bg-white/95 p-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setShowValidation(false);
                  setError(null);
                  setStep(1);
                }}
                className="flex-1 rounded-lg border border-papufy-border py-3 text-sm font-semibold text-papufy-muted hover:bg-gray-50"
              >
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 py-3 text-sm font-bold text-white"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmit()}
                className="flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {submitting ? "Publicando..." : labels.submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
