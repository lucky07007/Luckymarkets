import { Tracked } from "@/lib/types";

function formatAsOf(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrackedStat({
  label,
  data,
  suffix = "",
}: {
  label: string;
  data: Tracked<number>;
  suffix?: string;
}) {
  return (
    <div className="stat-block">
      <p className="stat-label">{label}</p>
      <p className="stat-value">
        {data.value}
        {suffix}
      </p>
      <p className={`stat-asof${data.stale ? " stale" : ""}`}>
        {data.stale ? "Last confirmed" : "As of"} {formatAsOf(data.asOf)}
      </p>
    </div>
  );
}
