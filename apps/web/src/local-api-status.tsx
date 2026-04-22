import { trpc } from "./trpc";

export interface LocalApiStatusProps {
  label?: string;
  stateLabels?: {
    online: string;
    offline: string;
    checking: string;
  };
}

export function LocalApiStatus({
  label = "Local API",
  stateLabels = {
    online: "online",
    offline: "offline",
    checking: "checking",
  },
}: LocalApiStatusProps) {
  const health = trpc.health.get.useQuery(undefined, {
    retry: false,
    refetchInterval: 15_000,
  });

  const state = health.data?.ok
    ? "online"
    : health.isError
      ? "offline"
      : "checking";
  const color =
    state === "online"
      ? "bg-[var(--lg-success-text)]"
      : state === "offline"
        ? "bg-[var(--lg-danger-text)]"
        : "bg-[var(--lg-subtle)]";

  return (
    <div
      aria-label={`${label} ${stateLabels[state]}`}
      className="flex h-10 items-center gap-2 rounded-md border border-[var(--lg-border)] px-3 text-xs text-[var(--lg-muted)]"
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="hidden lg:inline">{label}</span>
    </div>
  );
}
