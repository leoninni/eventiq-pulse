import { statusColors, type Status } from "@/lib/eventiq/mockData";

export function StatusBadge({ status }: { status: Status }) {
  const c = statusColors[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${c.bg} ${c.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  );
}
