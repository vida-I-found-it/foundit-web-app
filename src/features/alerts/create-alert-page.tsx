import { CheckCircle2, Clock, Link as LinkIcon, Lock, Mail, Search } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Notice } from "@/components/ui/notice";
import { RepeatableField, type RepeatableRow } from "@/components/ui/repeatable-field";
import { TextAreaField } from "@/components/ui/text-area-field";
import { type CreatedAlert, createAlert } from "./api/alerts-client";
import { mapApiError } from "./api/map-api-error";
import { ConfirmDialog } from "./components/confirm-dialog";
import { alertMessages as t } from "./messages";
import {
  type FormErrors,
  MAX_EMAILS,
  MAX_NOTES,
  MAX_URLS,
  buildRequest,
  hasErrors,
  maskEmail,
  normalizeUrl,
  validateForm,
} from "./model";

const emptyErrors: FormErrors = { urls: [], emails: [], urlWarnings: [], emailWarnings: [] };

function useRows() {
  const next = useRef(2);
  const [rows, setRows] = useState<RepeatableRow[]>([{ id: 1, value: "" }]);
  return {
    rows,
    change: (id: number, value: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, value } : x))),
    add: () => setRows((r) => [...r, { id: next.current++, value: "" }]),
    remove: (id: number) => setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r)),
    reset: () => setRows([{ id: next.current++, value: "" }]),
  };
}

function hostOf(url: string): string {
  return normalizeUrl(url) ? new URL(url).host : url;
}

export function CreateAlertPage() {
  const urls = useRows();
  const emails = useRows();
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);
  const [banner, setBanner] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ alert: CreatedAlert; masked: string[] } | null>(null);
  const inFlight = useRef(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const values = {
    urls: urls.rows.map((r) => r.value),
    emails: emails.rows.map((r) => r.value),
    notes,
  };
  const urlCount = urls.rows.filter((r) => r.value.trim()).length;
  const emailCount = emails.rows.filter((r) => r.value.trim()).length;
  const built = buildRequest(values);

  // El foco se mueve en un efecto, tras el commit: el destino ya existe y no depende de temporizadores.
  const [bannerTick, setBannerTick] = useState(0);
  useEffect(() => {
    if (bannerTick > 0) bannerRef.current?.focus();
  }, [bannerTick]);
  useEffect(() => {
    if (created) successRef.current?.focus();
  }, [created]);

  function startOver() {
    urls.reset();
    emails.reset();
    setNotes("");
    setErrors(emptyErrors);
    setBanner(null);
    setCreated(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateForm(values);
    setErrors(found);
    if (hasErrors(found)) {
      setBanner(t.errors.summary);
      setBannerTick((n) => n + 1);
      return;
    }
    setBanner(null);
    setConfirming(true); // US-02-03-AC1: nada se envía antes de confirmar.
  }

  async function handleConfirm() {
    if (inFlight.current) return; // guarda síncrona: el estado tarda un render en deshabilitar el botón
    inFlight.current = true;
    setSubmitting(true);
    const request = buildRequest(values);
    try {
      const alert = await createAlert({
        mode: "url",
        urls: request.urls,
        emails: request.emails,
        notes: request.notes,
      });
      setCreated({ alert, masked: request.emails.map(maskEmail) });
      setConfirming(false);
    } catch (error) {
      setConfirming(false);
      const mapped = mapApiError(error, request);
      setBanner(mapped.banner);
      setErrors(mapped.errors);
      setBannerTick((n) => n + 1);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="max-w-2xl">
        {created ? (
          <section aria-labelledby="success-title" className="border border-border bg-surface p-6">
            <CheckCircle2 className="size-8 text-accent-text" aria-hidden />
            <h1 id="success-title" ref={successRef} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight">
              {t.success.title}
            </h1>
            <p className="mt-2">{t.success.lead(created.alert.urls.length)}</p>
            {/* US-02-05-AC1: el correo solo se muestra enmascarado. */}
            <p className="mt-1 break-words">{t.success.notify(created.masked)}</p>
            {/* US-03-05-AC1/AC3: aviso fijo en todo éxito (también si `schedule` falló); role="status" no roba el foco del título. */}
            <div className="mt-4">
              <Notice icon={Clock} role="status">
                {t.success.background}
              </Notice>
            </div>
            <p className="mt-3 font-mono text-xs text-muted">
              {t.success.reference}: {created.alert.id}
            </p>
            <Button className="mt-6" onClick={startOver}>
              {t.success.another}
            </Button>
          </section>
        ) : (
          <form noValidate onSubmit={handleSubmit} aria-labelledby="form-title" className="space-y-6">
            <PageHeader title={t.page.title} titleId="form-title" description={t.page.intro} />

            <ErrorBanner ref={bannerRef} message={banner} />

            <fieldset>
              <legend className="mb-2 text-sm font-medium">{t.mode.label}</legend>
              <div className="inline-flex border border-border">
                <button
                  type="button"
                  aria-pressed="true"
                  className="inline-flex h-11 items-center gap-2 bg-accent px-4 text-sm font-medium text-accent-fg"
                >
                  <LinkIcon className="size-4" aria-hidden />
                  {t.mode.url}
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center gap-2 px-4 text-sm text-muted disabled:cursor-not-allowed"
                >
                  <Search className="size-4" aria-hidden />
                  {t.mode.keyword}
                  <span className="border border-border px-1.5 text-xs">{t.mode.soon}</span>
                </button>
              </div>
            </fieldset>

            <RepeatableField
              name="urls"
              label={t.urls.label}
              rows={urls.rows}
              max={MAX_URLS}
              counter={t.urls.count(urlCount, MAX_URLS)}
              type="url"
              placeholder={t.urls.placeholder}
              icon={<LinkIcon className="size-4" />}
              itemLabel={t.urls.itemLabel}
              removeLabel={t.urls.remove}
              addLabel={t.urls.add}
              generalError={errors.urlsGeneral}
              errors={errors.urls}
              warnings={errors.urlWarnings}
              onChange={urls.change}
              onAdd={urls.add}
              onRemove={urls.remove}
            />

            <RepeatableField
              name="emails"
              label={t.emails.label}
              rows={emails.rows}
              max={MAX_EMAILS}
              counter={t.emails.count(emailCount, MAX_EMAILS)}
              type="email"
              placeholder={t.emails.placeholder}
              icon={<Mail className="size-4" />}
              itemLabel={t.emails.itemLabel}
              removeLabel={t.emails.remove}
              addLabel={t.emails.add}
              help={t.emails.help}
              generalError={errors.emailsGeneral}
              errors={errors.emails}
              warnings={errors.emailWarnings}
              onChange={emails.change}
              onAdd={emails.add}
              onRemove={emails.remove}
            />

            <TextAreaField
              label={t.notes.label}
              counter={t.notes.count(notes.length, MAX_NOTES)}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={errors.notes}
            />

            <Notice icon={Lock}>{t.notice}</Notice>

            <div className="flex justify-end">
              <Button type="submit">{t.actions.save}</Button>
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        pageCount={built.urls.length}
        maskedEmails={built.emails.map(maskEmail)}
        hosts={built.urls.map(hostOf)}
        submitting={submitting}
        onCancel={() => setConfirming(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
