import { type TextareaHTMLAttributes, useId } from "react";

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "aria-invalid" | "aria-describedby"> {
  label: string;
  counter?: string;
  error?: string;
}

export function TextAreaField({ label, counter, error, ...props }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {counter && <span className="font-mono text-xs text-muted">{counter}</span>}
      </div>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full border border-border bg-surface p-3 text-sm"
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
