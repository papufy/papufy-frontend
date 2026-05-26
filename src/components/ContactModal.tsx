import type { ContactInfo } from "../types";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  contact: ContactInfo | null;
  mensagem?: string;
  onOpenChat?: () => void;
}

export function ContactModal({
  open,
  onClose,
  contact,
  mensagem,
  onOpenChat,
}: ContactModalProps) {
  if (!open || !contact) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2
            id="contact-modal-title"
            className="text-lg font-bold text-papufy-text"
          >
            Contato do contratante
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-papufy-muted hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {mensagem && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            {mensagem}
          </p>
        )}

        {contact.contratante && (
          <p className="mb-2 text-sm text-papufy-muted">
            <span className="font-semibold text-papufy-text">
              {contact.contratante.nome}
            </span>
            {contact.contratante.cidade && contact.contratante.uf && (
              <> · {contact.contratante.cidade}, {contact.contratante.uf}</>
            )}
          </p>
        )}

        <div className="space-y-3">
          {onOpenChat && (
            <button
              type="button"
              onClick={() => {
                onOpenChat();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-papufy-orange py-3 font-bold text-white transition hover:bg-papufy-orange-dark"
            >
              Abrir chat em tempo real
            </button>
          )}
          <div className="rounded-xl border border-papufy-border bg-sky-50 p-4 text-sm text-papufy-text">
            <p className="font-bold">Contatos protegidos</p>
            <p className="mt-1 text-papufy-muted">
              Para sua segurança, telefone e endereço não ficam disponíveis no
              chat. Use o chat interno para combinar detalhes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-papufy-border py-2.5 text-sm font-medium text-papufy-muted hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
