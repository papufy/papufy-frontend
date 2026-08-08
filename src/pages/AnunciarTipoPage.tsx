import { Navigate } from "react-router-dom";

/** Mantém o link antigo; a escolha de tipo agora vive em /anunciar. */
export function AnunciarTipoPage() {
  return <Navigate to="/anunciar" replace />;
}
