import * as React from "react";
import { cn } from "./utils";

export const fieldControlClass =
  "mt-2 w-full rounded-md border border-[var(--lg-border-strong)] bg-[var(--lg-input)] px-3 py-2 text-sm text-[var(--lg-text)] outline-none transition placeholder:text-[var(--lg-subtle)] focus:border-[var(--lg-focus)] focus:ring-2 focus:ring-[var(--lg-focus-soft)] disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "text-sm font-medium text-[var(--lg-text)]";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn(labelClass, className)} {...props} />
));
Label.displayName = "Label";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldControlClass, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldControlClass, className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(fieldControlClass, className)} {...props} />
));
Select.displayName = "Select";

export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5", className)} {...props} />;
}

export function FieldHint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-6 text-[var(--lg-muted)]", className)}
      {...props}
    />
  );
}
