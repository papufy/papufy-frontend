export type JobStatus = "OPEN" | "CLOSED";

export type ListingType = "JOB_VACANCY" | "PROFESSIONAL_PROFILE";
export type ListingStatus = "OPEN" | "CLOSED";

export interface UserReputation {
  averageRating: number | null;
  reviewCount: number;
  completedJobsCount: number;
}

export interface TransactionReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewedUserId: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  cpfCnpj?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  uf?: string | null;
  asaasWalletId?: string | null;
  asaasCustomerId?: string | null;
  curriculoUrl?: string | null;
  createdAt?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  ordem: number;
}

export interface Listing {
  id: string;
  userId: string;
  listingType: ListingType;
  titulo: string;
  descricao: string;
  preco: number | null;
  aCombinar: boolean;
  categoria: string;
  semQualificacao?: boolean;
  status: ListingStatus;
  cep?: string | null;
  cidade: string;
  bairro?: string | null;
  uf: string;
  telefone?: string;
  createdAt: string;
  criador?: {
    id: string;
    nome: string;
    cidade?: string | null;
    uf?: string | null;
    reputation?: UserReputation;
  };
  imagens?: ListingImage[];
  imagemCapa?: string | null;
  isOwner?: boolean;
  contactUnlocked?: boolean;
}

export interface Certificate {
  id: string;
  userId: string;
  nome: string;
  arquivoUrl: string;
  createdAt: string;
}

export interface ListingsPage {
  listings: Listing[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface Job {
  id: string;
  titulo: string;
  descricao: string;
  preco: number | null;
  aCombinar: boolean;
  categoria: string;
  status: JobStatus;
  cep?: string | null;
  cidade: string;
  bairro?: string | null;
  uf: string;
  telefone?: string;
  userId?: string;
  createdAt: string;
  criador?: {
    id: string;
    nome: string;
    cidade?: string | null;
    uf?: string | null;
    telefone?: string | null;
    email?: string;
  };
  interesses?: number;
  isOwner?: boolean;
  myConversationId?: string | null;
}

export interface JobInterestItem {
  id: string;
  createdAt: string;
  profissional: {
    id: string;
    nome: string;
    telefone?: string | null;
    cidade?: string | null;
    uf?: string | null;
  };
  conversationId: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ContactInfo {
  telefone: string;
  contratante?: {
    nome: string;
    telefone?: string | null;
    email?: string;
    cidade?: string | null;
    uf?: string | null;
  };
}

export interface InterestResponse {
  conversationId: string;
  contato: ContactInfo;
  mensagem: string;
}

export interface CreateJobPayload {
  titulo: string;
  descricao: string;
  preco?: number | null;
  aCombinar: boolean;
  categoria: string;
  cep?: string;
  cidade: string;
  bairro?: string;
  uf: string;
  telefone: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  type?: "TEXT" | "PROPOSAL" | "SYSTEM" | "IMAGE";
  proposalValue?: number | null;
  imageUrl?: string | null;
  transactionId?: string | null;
  senderId: string;
  senderNome: string;
  createdAt: string;
  isMine: boolean;
}

export interface ConversationSummary {
  id: string;
  contextType: "job" | "listing";
  jobId?: string;
  listingId?: string;
  contractorId?: string;
  providerId?: string;
  myRole?: "contractor" | "provider";
  /** Tipo do anúncio vinculado à conversa */
  listingType?: ListingType;
  contextTitulo: string;
  contextCategoria: string;
  otherUser: { id: string; nome: string };
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unread: number;
  updatedAt: string;
}

export type BillingType = "PIX" | "CREDIT_CARD";
export type TransactionStatus =
  | "PENDING"
  | "PAID"
  | "IN_DISPUTE"
  | "RELEASED"
  | "WITHDRAWN"
  | "FAILED"
  | "CANCELED";

export interface Transaction {
  id: string;
  listingId: string;
  contractorId: string;
  professionalId: string;
  asaasPaymentId?: string | null;
  amountGross: number;
  platformFee: number;
  professionalNet: number;
  billingType: BillingType;
  status: TransactionStatus;
  pixQrCodeImage?: string | null;
  pixCopyPaste?: string | null;
  invoiceUrl?: string | null;
  paymentLink?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  contractorConfirmedAt?: string | null;
  professionalConfirmedAt?: string | null;
  releasedAt?: string | null;
  withdrawnAt?: string | null;
  withdrawPixKey?: string | null;
  withdrawTransferId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  transactionId?: string | null;
  conversationId?: string | null;
  reporterId: string;
  descricao: string;
  comprovanteUrl?: string | null;
  status: "ABERTO" | "EM_ANALISE" | "RESOLVIDO";
  createdAt: string;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
