import { useNavigate } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Card, CardContent } from "@/components/ui/card";
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
        <FadeContent>
          <h1 className="text-xl font-extrabold text-foreground">
            Anunciar Grátis
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha o que você quer publicar. São só 2 etapas rápidas.
          </p>
        </FadeContent>

        <FadeContent delay={60}>
          <button
            type="button"
            onClick={() => go("JOB_VACANCY")}
            className="block w-full text-left active:scale-[0.98]"
          >
            <Card className="border-2 border-sky-200 bg-sky-50/80 py-0 shadow-sm ring-0 transition hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-3 p-6">
                <span className="text-3xl">🧰</span>
                <span className="text-lg font-bold text-foreground">
                  Preciso de um serviço
                </span>
                <span className="text-sm text-muted-foreground">
                  Publique o que você precisa e receba contato de quem pode ajudar.
                </span>
              </CardContent>
            </Card>
          </button>
        </FadeContent>

        <FadeContent delay={120}>
          <button
            type="button"
            onClick={() => go("PROFESSIONAL_PROFILE")}
            className="block w-full text-left active:scale-[0.98]"
          >
            <Card className="border-2 border-blue-200 bg-blue-50/80 py-0 shadow-sm ring-0 transition hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-3 p-6">
                <span className="text-3xl">👷</span>
                <span className="text-lg font-bold text-foreground">
                  Ofereço um serviço
                </span>
                <span className="text-sm text-muted-foreground">
                  Mostre o que você faz para clientes da sua região te encontrarem.
                </span>
              </CardContent>
            </Card>
          </button>
        </FadeContent>
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
