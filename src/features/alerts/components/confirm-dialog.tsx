import { Clock, Link as LinkIcon, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { alertMessages as t } from "../messages";

interface Props {
  open: boolean;
  pageCount: number;
  maskedEmails: string[];
  hosts: string[];
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Modal de confirmación de la alerta inmutable (US-02-03). El mecanismo del modal vive en ui/dialog. */
export function ConfirmDialog({ open, pageCount, maskedEmails, hosts, submitting, onCancel, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      // Escape = cancelar (US-02-03-AC2), salvo mientras se envía: ahí no hay vuelta atrás.
      locked={submitting}
      role="alertdialog"
      titleId="confirm-title"
      descriptionId="confirm-lead"
    >
      <div className="grid size-10 place-items-center bg-accent text-accent-fg">
        <Lock className="size-5" aria-hidden />
      </div>
      <h2 id="confirm-title" className="mt-4 text-2xl font-semibold tracking-tight">
        {t.confirm.title}
      </h2>
      <p id="confirm-lead" className="mt-2 text-muted">
        {t.confirm.lead}
      </p>
      <ul className="mt-5 space-y-4">
        <li className="flex gap-3">
          <LinkIcon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0">
            <b className="font-semibold">{t.confirm.pages(pageCount)}</b>
            <small className="block break-words text-muted">{hosts.join(", ")}</small>
          </div>
        </li>
        <li className="flex gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0">
            <b className="font-semibold break-words">{t.confirm.notify(maskedEmails)}</b>
            <small className="block text-muted">{t.confirm.unsubscribe}</small>
          </div>
        </li>
        <li className="flex gap-3">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div>
            <b className="font-semibold">{t.confirm.schedule}</b>
            <small className="block text-muted">{t.confirm.scheduleDetail}</small>
          </div>
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" disabled={submitting} onClick={onCancel}>
          {t.confirm.back}
        </Button>
        {/* disabled mientras envía: evita la doble petición por doble clic (US-02-03-AC3). */}
        <Button type="button" disabled={submitting} aria-busy={submitting} onClick={onConfirm}>
          {submitting ? t.confirm.creating : t.confirm.create}
        </Button>
      </div>
    </Dialog>
  );
}
