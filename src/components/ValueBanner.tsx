import { FadeContent } from "@/components/effects/FadeContent";
import { ShineBorder } from "@/components/effects/ShineBorder";
import { Card, CardContent } from "@/components/ui/card";

export function ValueBanner() {
  return (
    <section className="page-container pt-3 sm:pt-4">
      <FadeContent delay={80}>
        <ShineBorder borderRadius="1rem" className="shadow-sm">
          <Card className="border-0 bg-gradient-to-br from-card to-sky-50/80 py-0 shadow-none ring-0">
            <CardContent className="px-4 py-5 text-center sm:px-6 sm:py-8">
              <h2 className="text-lg font-bold text-foreground sm:text-2xl">
                Serviços perto de você, sem complicação
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Publique o que você precisa em minutos e receba contato de
                profissionais da sua região. Quer trabalhar? Encontre
                oportunidades escaneáveis, no estilo classificados — direto ao
                ponto.
              </p>
            </CardContent>
          </Card>
        </ShineBorder>
      </FadeContent>
    </section>
  );
}
