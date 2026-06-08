import { useNavigate } from "react-router-dom";
import { MobileShell } from "../components/mobile/MobileShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { ListingType } from "../types";

function AnunciarTipoContent() {
  const navigate = useNavigate();

  const go = (listingType: ListingType) => {
    navigate("/anunciar", { state: { listingType } });
  };

  return (
    <MobileShell>
      <div className="page-container space-y-4 py-6">
        <h1 className="text-xl font-extrabold text-papufy-text">
          Anunciar Grátis
        </h1>
        <p className="text-sm text-papufy-muted">
          Escolha o que você quer publicar. São só 2 etapas rápidas.
        </p>

        <button
          type="button"
          onClick={() => go("JOB_VACANCY")}
          className="flex w-full select-none flex-col items-start gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50 p-6 text-left shadow-sm active:scale-[0.98]"
        >
          <span className="text-3xl">🧰</span>
          <span className="text-lg font-bold text-papufy-text">
            Preciso de um serviço
          </span>
          <span className="text-sm text-papufy-muted">
            Publique o que você precisa e receba contato de quem pode ajudar.
          </span>
        </button>

        <button
          type="button"
          onClick={() => go("PROFESSIONAL_PROFILE")}
          className="flex w-full select-none flex-col items-start gap-3 rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 text-left shadow-sm active:scale-[0.98]"
        >
          <span className="text-3xl">👷</span>
          <span className="text-lg font-bold text-papufy-text">
            Ofereço um serviço
          </span>
          <span className="text-sm text-papufy-muted">
            Mostre o que você faz para clientes da sua região te encontrarem.
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
