import { useNavigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { ProtectedRoute } from "../components/ProtectedRoute";

function AnunciarTipoContent() {
  const navigate = useNavigate();

  return (
    <MobileShell showSearch={false}>
      <div className="page-container space-y-4 py-6">
        <h1 className="text-xl font-extrabold text-papufy-text">
          Anunciar Grátis
        </h1>
        <p className="text-sm text-papufy-muted">
          Escolha como você quer usar o Papufy hoje.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/anunciar", {
              state: { listingType: "JOB_VACANCY" },
            })
          }
          className="flex w-full select-none flex-col items-start gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 text-left shadow-sm active:scale-[0.98]"
        >
          <span className="text-3xl">🧰</span>
          <span className="text-lg font-bold text-papufy-text">
            Preciso de ajuda
          </span>
          <span className="text-sm text-papufy-muted">
            Poste um pedido de serviço para receber contato de profissionais.
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/anunciar", {
              state: { listingType: "PROFESSIONAL_PROFILE" },
            })
          }
          className="flex w-full select-none flex-col items-start gap-3 rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 text-left shadow-sm active:scale-[0.98]"
        >
          <span className="text-3xl">👷</span>
          <span className="text-lg font-bold text-papufy-text">
            Quero trabalhar
          </span>
          <span className="text-sm text-papufy-muted">
            Anuncie seu perfil profissional para ser encontrado por clientes.
          </span>
        </button>
      </div>
    </MobileShell>
  );
}

export function AnunciarTipoPage() {
  return (
    <ProtectedRoute>
      <AnunciarTipoContent />
    </ProtectedRoute>
  );
}
