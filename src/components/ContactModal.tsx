import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="w-full max-w-md border-0 py-0 shadow-xl ring-0">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle id="contact-modal-title" className="text-lg">
            Contato do contratante
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {mensagem && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              {mensagem}
            </p>
          )}

          {contact.contratante && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {contact.contratante.nome}
              </span>
              {contact.contratante.cidade && contact.contratante.uf && (
                <> · {contact.contratante.cidade}, {contact.contratante.uf}</>
              )}
            </p>
          )}

          {onOpenChat && (
            <Button
              type="button"
              variant="papufy"
              size="cta"
              className="w-full"
              onClick={() => {
                onOpenChat();
                onClose();
              }}
            >
              Abrir chat em tempo real
            </Button>
          )}

          <div className="rounded-xl border border-border bg-sky-50 p-4 text-sm text-foreground">
            <p className="font-bold">Contatos protegidos</p>
            <p className="mt-1 text-muted-foreground">
              Para sua segurança, telefone e endereço não ficam disponíveis no
              chat. Use o chat interno para combinar detalhes.
            </p>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
