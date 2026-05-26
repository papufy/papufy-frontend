import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import {
  BICO_CATEGORIES,
  BRAZIL_STATES,
  PROFESSIONAL_CATEGORIES,
} from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";

type Step = 1 | 2 | 3;
type ListingType = "JOB_VACANCY" | "PROFESSIONAL_PROFILE";

export function CreateJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialType = (location.state as { listingType?: ListingType } | null)
    ?.listingType;
  const [listingType] = useState<ListingType>(initialType ?? "JOB_VACANCY");

  const categories =
    listingType === "JOB_VACANCY" ? BICO_CATEGORIES : PROFESSIONAL_CATEGORIES;

  const [titulo, setTitulo] = useState(
    listingType === "JOB_VACANCY" ? "" : `${user?.nome ?? ""} - `
  );
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<string>(categories[0]);
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState(user?.cidade || "Campina Grande");
  const [bairro, setBairro] = useState("");
  const [uf, setUf] = useState(user?.uf || "PB");
  const [raioAtuacao, setRaioAtuacao] = useState(
    `${user?.cidade || "Campina Grande"} e região`
  );
  const [preco, setPreco] = useState("");
  const [aCombinar, setACombinar] = useState(false);
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [imagens, setImagens] = useState<File[]>([]);

  const labels = useMemo(
    () =>
      listingType === "JOB_VACANCY"
        ? {
            pageTitle: "Publicar pedido de serviço",
            subtitle: "Descreva o problema para receber propostas.",
            titleLabel: "Título do problema",
            titlePlaceholder: "Ex: Pia vazando no banheiro",
            descLabel: "Descrição detalhada",
            descPlaceholder:
              "Explique o problema, urgência, referências e horário ideal.",
            moneyLabel: "Orçamento estimado (R$)",
            moneyPlaceholder: "150",
            phoneHint:
              "Profissionais verão seu contato ao clicar em 'Quero fazer esse serviço'.",
            submitLabel: "Publicar serviço",
          }
        : {
            pageTitle: "Anunciar perfil profissional",
            subtitle: "Mostre suas habilidades para receber clientes.",
            titleLabel: "Título do serviço/profissão",
            titlePlaceholder: "Ex: João Silva - Eletricista Residencial",
            descLabel: "Descrição das habilidades",
            descPlaceholder:
              "Conte sua experiência, certificações e diferenciais.",
            moneyLabel: "Valor da diária/hora (R$)",
            moneyPlaceholder: "200",
            phoneHint:
              "Clientes usarão este contato ao clicar em 'Contratar Profissional'.",
            submitLabel: "Publicar perfil",
          },
    [listingType]
  );

  const parsedPreco = () => {
    const raw = preco.replace(/[^\d,]/g, "").replace(",", ".");
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const canNext =
    (step === 1 && titulo.trim().length >= 5 && descricao.trim().length >= 20) ||
    (step === 2 &&
      cidade.trim().length >= 2 &&
      uf.length === 2 &&
      telefone.trim().length >= 8) ||
    (step === 3 && (aCombinar || parsedPreco() > 0));

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("listingType", listingType);
      formData.append("titulo", titulo.trim());
      formData.append("descricao", descricao.trim());
      formData.append("categoria", categoria);
      formData.append("cep", cep.trim());
      formData.append("cidade", cidade.trim());
      formData.append("bairro", bairro.trim());
      formData.append("uf", uf);
      formData.append("telefone", telefone.trim());
      formData.append("aCombinar", String(aCombinar));
      if (!aCombinar) formData.append("preco", String(parsedPreco()));
      if (listingType === "PROFESSIONAL_PROFILE") {
        formData.append("raioAtuacao", raioAtuacao.trim());
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

  return (
    <MobileShell showCategories={false}>
      <div className="page-container mx-auto max-w-2xl py-5">
        <h1 className="text-2xl font-extrabold text-papufy-text">
          {labels.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-papufy-muted">
          Etapa {step} de 3 — {labels.subtitle}
        </p>

        <div className="mt-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-papufy-orange" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-papufy-border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-papufy-text">
                {listingType === "JOB_VACANCY"
                  ? "Conte a sua necessidade"
                  : "Apresente seu serviço"}
              </h2>
              <div>
                <label className="text-sm font-medium">{labels.titleLabel}</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={labels.titlePlaceholder}
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{labels.descLabel}</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={5}
                  placeholder={labels.descPlaceholder}
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-papufy-text">Localização e contato</h2>
              <div>
                <label className="text-sm font-medium">CEP (opcional)</label>
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">UF</label>
                  <select
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
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
                  <label className="text-sm font-medium">Raio de atuação</label>
                  <input
                    value={raioAtuacao}
                    onChange={(e) => setRaioAtuacao(e.target.value)}
                    placeholder="Ex: Campina Grande e bairros próximos"
                    className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Bairro (opcional)</label>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Telefone (liberado após pagamento)
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  inputMode="numeric"
                  placeholder="(83) 99999-9999"
                  className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-papufy-text">Valores e imagens</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aCombinar}
                  onChange={(e) => setACombinar(e.target.checked)}
                  className="h-4 w-4 accent-papufy-orange"
                />
                <span className="text-sm">A combinar</span>
              </label>
              {!aCombinar && (
                <div>
                  <label className="text-sm font-medium">{labels.moneyLabel}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder={labels.moneyPlaceholder}
                    className="mt-1 w-full rounded-lg border border-papufy-border px-4 py-3 text-sm outline-none focus:border-papufy-orange"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Fotos (até 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImagens(Array.from(e.target.files ?? []).slice(0, 5))
                  }
                  className="mt-1 w-full rounded-lg border border-dashed border-papufy-border px-4 py-3 text-sm"
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
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-papufy-muted"
                      >
                        {img.name.slice(0, 18)} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-papufy-muted">{labels.phoneHint}</p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] -mx-4 mt-6 flex gap-3 border-t border-papufy-border bg-white/95 p-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1 rounded-lg border border-papufy-border py-3 text-sm font-semibold text-papufy-muted hover:bg-gray-50"
              >
                Voltar
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex-1 rounded-lg bg-papufy-orange py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext || submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-papufy-orange py-3 text-sm font-bold text-white disabled:opacity-50"
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
