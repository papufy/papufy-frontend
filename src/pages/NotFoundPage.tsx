import { Link } from "react-router-dom";
import { FadeContent } from "@/components/effects/FadeContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "../components/Layout";

export function NotFoundPage() {
  return (
    <Layout showCategories={false}>
      <div className="page-container mx-auto max-w-lg py-16 text-center sm:py-24">
        <FadeContent>
          <Card className="border-0 py-0 shadow-sm ring-border/80">
            <CardContent className="px-6 py-10">
              <p className="text-6xl font-extrabold text-primary">404</p>
              <h1 className="mt-4 text-2xl font-bold text-foreground">
                Página não encontrada
              </h1>
              <p className="mt-2 text-muted-foreground">
                O endereço pode estar incorreto ou o conteúdo foi removido.
              </p>
              <Button variant="papufy" size="cta" className="mt-8" asChild>
                <Link to="/">Voltar para a Home</Link>
              </Button>
            </CardContent>
          </Card>
        </FadeContent>
      </div>
    </Layout>
  );
}
