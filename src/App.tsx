import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLoader } from "./components/PageLoader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { FilterProvider } from "./context/FilterContext";
import { ToastProvider } from "./context/ToastContext";
import { lazyWithRetry } from "./lib/lazyWithRetry";

const HomePage = lazyWithRetry(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const SearchPage = lazyWithRetry(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage }))
);
const ListingDetailPage = lazyWithRetry(() =>
  import("./pages/ListingDetailPage").then((m) => ({
    default: m.ListingDetailPage,
  }))
);
const LoginPage = lazyWithRetry(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const AnunciarTipoPage = lazyWithRetry(() =>
  import("./pages/AnunciarTipoPage").then((m) => ({ default: m.AnunciarTipoPage }))
);
const CreateJobPage = lazyWithRetry(() =>
  import("./pages/CreateJobPage").then((m) => ({ default: m.CreateJobPage }))
);
const JobDetailPage = lazyWithRetry(() =>
  import("./pages/JobDetailPage").then((m) => ({ default: m.JobDetailPage }))
);
const ChatPage = lazyWithRetry(() =>
  import("./pages/ChatPage").then((m) => ({ default: m.ChatPage }))
);
const MyJobsPage = lazyWithRetry(() =>
  import("./pages/MyJobsPage").then((m) => ({ default: m.MyJobsPage }))
);
const ProfilePage = lazyWithRetry(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const ProfileWalletPage = lazyWithRetry(() =>
  import("./pages/ProfileWalletPage").then((m) => ({
    default: m.ProfileWalletPage,
  }))
);
const UserPublicProfilePage = lazyWithRetry(() =>
  import("./pages/UserPublicProfilePage").then((m) => ({
    default: m.UserPublicProfilePage,
  }))
);
const WalletPage = lazyWithRetry(() =>
  import("./pages/WalletPage").then((m) => ({ default: m.WalletPage }))
);
const NotificationsPage = lazyWithRetry(() =>
  import("./pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  }))
);
const NotFoundPage = lazyWithRetry(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ChatProvider>
            <FilterProvider>
              <FavoritesProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/buscar" element={<SearchPage />} />
                    <Route path="/anuncio/:id" element={<ListingDetailPage />} />
                    <Route path="/usuario/:id" element={<UserPublicProfilePage />} />
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
                      path="/perfil/carteira"
                      element={
                        <ProtectedRoute>
                          <ProfileWalletPage />
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
              </FavoritesProvider>
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
