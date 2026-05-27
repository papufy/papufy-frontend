import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLoader } from "./components/PageLoader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { FilterProvider } from "./context/FilterContext";
import { ToastProvider } from "./context/ToastContext";

const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage }))
);
const ListingDetailPage = lazy(() =>
  import("./pages/ListingDetailPage").then((m) => ({
    default: m.ListingDetailPage,
  }))
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const AnunciarTipoPage = lazy(() =>
  import("./pages/AnunciarTipoPage").then((m) => ({ default: m.AnunciarTipoPage }))
);
const CreateJobPage = lazy(() =>
  import("./pages/CreateJobPage").then((m) => ({ default: m.CreateJobPage }))
);
const JobDetailPage = lazy(() =>
  import("./pages/JobDetailPage").then((m) => ({ default: m.JobDetailPage }))
);
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((m) => ({ default: m.ChatPage }))
);
const MyJobsPage = lazy(() =>
  import("./pages/MyJobsPage").then((m) => ({ default: m.MyJobsPage }))
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const WalletPage = lazy(() =>
  import("./pages/WalletPage").then((m) => ({ default: m.WalletPage }))
);
const NotificationsPage = lazy(() =>
  import("./pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ChatProvider>
            <FilterProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/buscar" element={<SearchPage />} />
                    <Route path="/anuncio/:id" element={<ListingDetailPage />} />
                    <Route path="/entrar" element={<LoginPage />} />
                    <Route path="/anunciar/tipo" element={<AnunciarTipoPage />} />
                    <Route
                      path="/anunciar"
                      element={
                        <ProtectedRoute>
                          <CreateJobPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/trabalho/:id" element={<JobDetailPage />} />
                    <Route path="/bico/:id" element={<RedirectTrabalho />} />
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
                      path="/notificacoes"
                      element={
                        <ProtectedRoute>
                          <NotificationsPage />
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
                    <Route
                      path="/carteira"
                      element={
                        <ProtectedRoute>
                          <WalletPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pagamentos"
                      element={<Navigate to="/carteira" replace />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                <ToastContainer />
              </BrowserRouter>
            </FilterProvider>
          </ChatProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function RedirectTrabalho() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/trabalho/${id}`} replace />;
}
