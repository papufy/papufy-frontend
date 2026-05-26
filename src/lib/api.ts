import type {
  AuthResponse,
  Certificate,
  ChatMessage,
  ConversationSummary,
  CreateJobPayload,
  InterestResponse,
  Job,
  JobInterestItem,
  Listing,
  ListingsPage,
  User,
} from "../types";
import { getApiBaseUrl } from "./env";

const API_BASE = getApiBaseUrl();
const TOKEN_KEY = "papufy_token";

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearSessionStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("papufy_user");
}

function handleAuthFailure(status: number) {
  if (status === 401 || status === 403) {
    clearSessionStorage();
    unauthorizedHandler?.();
  }
}

function buildAuthHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    ...(extra as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = buildAuthHeaders({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  const url = `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      `Não foi possível conectar à API (${API_BASE}). Verifique o deploy no Render.`
    );
  }

  if (response.status === 204) {
    if (!response.ok) {
      handleAuthFailure(response.status);
    }
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthFailure(response.status);
    const message =
      typeof data.error === "string"
        ? data.error
        : "Erro na requisição. Tente novamente.";
    const err = new Error(message) as Error & { statusCode?: number };
    err.statusCode = response.status;
    throw err;
  }

  return data as T;
}

async function uploadRequest<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const headers = buildAuthHeaders();
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthFailure(response.status);
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Erro no envio do arquivo."
    );
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: {
      nome: string;
      email: string;
      senha: string;
      telefone?: string;
      cidade?: string;
      uf?: string;
    }) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    login: (email: string, senha: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      }),

    me: () => request<{ user: User }>("/auth/me"),

    updateProfile: (body: {
      nome?: string;
      telefone?: string;
      cidade?: string;
      uf?: string;
      senhaAtual?: string;
      novaSenha?: string;
    }) =>
      request<{ user: User }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  listings: {
    list: (params?: {
      search?: string;
      category?: string;
      tipo?: "BICO" | "PRODUTO";
      location?: string;
      uf?: string;
      cidade?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
      offset?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.category) query.set("category", params.category);
      if (params?.tipo) query.set("tipo", params.tipo);
      if (params?.location) query.set("location", params.location);
      if (params?.uf) query.set("uf", params.uf);
      if (params?.cidade) query.set("cidade", params.cidade);
      if (params?.minPrice != null)
        query.set("minPrice", String(params.minPrice));
      if (params?.maxPrice != null)
        query.set("maxPrice", String(params.maxPrice));
      if (params?.limit != null) query.set("limit", String(params.limit));
      if (params?.offset != null) query.set("offset", String(params.offset));
      const qs = query.toString();
      return request<ListingsPage>(`/listings${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => request<{ listing: Listing }>(`/listings/${id}`),

    create: (formData: FormData) =>
      uploadRequest<{ listing: Listing }>("/listings", formData),
  },

  user: {
    uploadCurriculo: (file: File, onProgress?: (pct: number) => void) => {
      const fd = new FormData();
      fd.append("curriculo", file);
      if (onProgress) onProgress(100);
      return uploadRequest<{ user: User; url: string; message: string }>(
        "/user/upload-curriculo",
        fd
      );
    },

    uploadCertificados: (
      files: File[],
      nomes?: string[],
      onProgress?: (pct: number) => void
    ) => {
      const fd = new FormData();
      files.forEach((f) => fd.append("certificados", f));
      if (nomes?.length) fd.append("nomes", JSON.stringify(nomes));
      if (onProgress) onProgress(100);
      return uploadRequest<{ certificates: Certificate[]; message: string }>(
        "/user/upload-certificado",
        fd
      );
    },

    listCertificates: () =>
      request<{ certificates: Certificate[] }>("/user/certificados"),
  },

  jobs: {
    list: (params?: {
      search?: string;
      category?: string;
      location?: string;
      uf?: string;
      cidade?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.category) query.set("category", params.category);
      if (params?.location) query.set("location", params.location);
      if (params?.uf) query.set("uf", params.uf);
      if (params?.cidade) query.set("cidade", params.cidade);
      const qs = query.toString();
      return request<{ jobs: Job[]; total: number }>(
        `/jobs${qs ? `?${qs}` : ""}`
      );
    },

    getById: (id: string) => request<{ job: Job }>(`/jobs/${id}`),

    create: (payload: CreateJobPayload) =>
      request<{ job: Job }>("/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    listMine: () => request<{ jobs: Job[]; total: number }>("/jobs/mine"),

    registerInterest: (id: string) =>
      request<InterestResponse>(`/jobs/${id}/interest`, {
        method: "POST",
      }),

    listInterests: (id: string) =>
      request<{ interests: JobInterestItem[] }>(`/jobs/${id}/interests`),

    update: (id: string, payload: Partial<CreateJobPayload>) =>
      request<{ job: Job }>(`/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),

    close: (id: string) =>
      request<{ job: Job }>(`/jobs/${id}/close`, { method: "PATCH" }),

    reopen: (id: string) =>
      request<{ job: Job }>(`/jobs/${id}/reopen`, { method: "PATCH" }),

    remove: (id: string) =>
      request<void>(`/jobs/${id}`, { method: "DELETE" }),

    categories: () =>
      request<{ categories: string[] }>("/jobs/categories/list"),
  },

  chat: {
    conversations: () =>
      request<{
        conversations: ConversationSummary[];
        unreadTotal: number;
      }>("/chat/conversations"),

    messages: (conversationId: string) =>
      request<{ messages: ChatMessage[] }>(
        `/chat/conversations/${conversationId}/messages`
      ),

    send: (conversationId: string, content: string) =>
      request<{ message: ChatMessage }>(
        `/chat/conversations/${conversationId}/messages`,
        { method: "POST", body: JSON.stringify({ content }) }
      ),

    unread: () => request<{ count: number }>("/chat/unread"),
  },
};

export function getApiBase(): string {
  return API_BASE;
}
