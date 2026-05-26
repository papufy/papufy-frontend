import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { FilterProvider } from "./context/FilterContext";
import { ToastProvider } from "./context/ToastContext";
import { ChatPage } from "./pages/ChatPage";
import { CreateJobPage } from "./pages/CreateJobPage";
import { AnunciarTipoPage } from "./pages/AnunciarTipoPage";
import { HomePage } from "./pages/HomePage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { MyJobsPage } from "./pages/MyJobsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SearchPage } from "./pages/SearchPage";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ChatProvider>
          <FilterProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/buscar" element={<SearchPage />} />
                <Route path="/anuncio/:id" element={<ListingDetailPage />} />
                <Route path="/entrar" element={<LoginPage />} />
                <Route
                  path="/anunciar/tipo"
                  element={<AnunciarTipoPage />}
                />
                <Route
                  path="/anunciar"
                  element={
                    <ProtectedRoute>
                      <CreateJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/trabalho/:id" element={<JobDetailPage />} />
                <Route path="/trabalho-vaga/:id" element={<RedirectTrabalho />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:id"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/minhas-publicacoes"
                  element={
                    <ProtectedRoute>
                      <MyJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <ToastContainer />
            </BrowserRouter>
          </FilterProvider>
        </ChatProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function RedirectTrabalho() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/trabalho/${id}`} replace />;
}
