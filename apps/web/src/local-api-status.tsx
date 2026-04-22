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
    checking: "checking"
  }
}: LocalApiStatusProps) {
  const health = trpc.health.get.useQuery(undefined, {
    retry: false,
    refetchInterval: 15_000
  });

  const state = health.data?.ok ? "online" : health.isError ? "offline" : "checking";
  const color =
    state === "online"
      ? "bg-emerald-400"
      : state === "offline"
        ? "bg-rose-400"
        : "bg-zinc-500";

  return (
    <div
      aria-label={`${label} ${stateLabels[state]}`}
      className="flex items-center gap-2 rounded border border-zinc-800 px-3 py-2 text-xs text-zinc-300"
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
