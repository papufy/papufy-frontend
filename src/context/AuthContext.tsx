import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cidade?: string;
    uf?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "papufy_token";
const USER_KEY = "papufy_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const persist = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.auth
      .me()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [token, logout]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const { user: loggedUser, token: jwt } = await api.auth.login(email, senha);
      persist(loggedUser, jwt);
    },
    [persist]
  );

  const register = useCallback(
    async (data: {
      nome: string;
      email: string;
      senha: string;
      telefone?: string;
      cidade?: string;
      uf?: string;
    }) => {
      const { user: newUser, token: jwt } = await api.auth.register(data);
      persist(newUser, jwt);
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
