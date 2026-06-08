import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { BRAZIL_STATES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { lookupCep, normalizeCep } from "../lib/cep";
import type { ListingType } from "../types";

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

  const step1Valid =
    listingType === "PROFESSIONAL_PROFILE"
      ? parsedRange().min > 0 &&
        parsedRange().max > 0 &&
        parsedRange().max >= parsedRange().min
      : parsedPreco() > 0;

  const step2Valid =
    titulo.trim().length >= 5 &&
    descricao.trim().length >= 20 &&
    cidade.trim().length >= 2 &&
    uf.length === 2 &&
    telefone.trim().length >= 8;

  const canNext = step === 1 ? step1Valid : step2Valid;

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
    setError(null);
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-sky-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

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
                      onChange={(e) => setPrecoMin(e.target.value)}
                      placeholder="100"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor máximo (R$)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      placeholder="350"
                      className={inputClass}
                    />
                  </div>
                  {parsedRange().max > 0 &&
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
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder={labels.moneyPlaceholder}
                    className={inputClass}
                  />
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
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={labels.titlePlaceholder}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{labels.descLabel}</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={5}
                  placeholder={labels.descPlaceholder}
                  className={inputClass}
                />
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
                    onChange={(e) => setCidade(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">UF</label>
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

              {listingType === "PROFESSIONAL_PROFILE" && (
                <div>
                  <label className="text-sm font-medium">Onde você atende</label>
                  <input
                    value={raioAtuacao}
                    onChange={(e) => setRaioAtuacao(e.target.value)}
                    placeholder="Ex: Campina Grande e região"
                    className={inputClass}
                  />
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
                  onChange={(e) => setTelefone(e.target.value)}
                  inputMode="numeric"
                  placeholder="(83) 99999-9999"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-papufy-muted">{labels.phoneHint}</p>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] -mx-4 mt-6 flex gap-3 border-t border-papufy-border bg-white/95 p-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-papufy-border py-3 text-sm font-semibold text-papufy-muted hover:bg-gray-50"
              >
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext || submitting}
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
