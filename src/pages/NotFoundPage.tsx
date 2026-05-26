import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function NotFoundPage() {
  return (
    <Layout showCategories={false}>
      <div className="page-container mx-auto max-w-lg py-16 text-center sm:py-24">
        <p className="text-6xl font-extrabold text-papufy-orange">404</p>
        <h1 className="mt-4 text-2xl font-bold text-papufy-text">
          Página não encontrada
        </h1>
        <p className="mt-2 text-papufy-muted">
          O endereço pode estar incorreto ou o conteúdo foi removido.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-papufy-orange px-6 py-3 font-bold text-white"
        >
          Voltar para a Home
        </Link>
      </div>
    </Layout>
  );
}
