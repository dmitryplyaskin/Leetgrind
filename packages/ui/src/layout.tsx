import * as React from "react";
import { cn } from "./utils";

export function AppSurface({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[var(--lg-bg)] text-[var(--lg-text)] transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
}

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

export function PageSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("grid gap-6 py-8", className)} {...props} />;
}

export function PageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-[var(--lg-border)] pb-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
      {...props}
    />
  );
}

export function Kicker({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-medium uppercase tracking-normal text-[var(--lg-accent-text)]",
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-[var(--lg-text)] md:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

export function PageLead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "max-w-3xl text-lg leading-8 text-[var(--lg-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function Divider({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-[var(--lg-border)]", className)}
      {...props}
    />
  );
}
