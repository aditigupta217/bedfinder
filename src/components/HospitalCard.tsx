import type { Hospital } from "@/lib/hospitals";
import { minutesAgo, statusFromIcu } from "@/lib/hospitals";
import { toast } from "sonner";

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 120, h = 36, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const trendDown = data[data.length - 1] < data[0];
  const color = trendDown ? "#E8341C" : "#16A34A";
  return (
    <svg width={w} height={h} className="block">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points.join(" ")} />
      <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

function BedStat({ label, free, total, tone }: { label: string; free: number; total: number; tone: "green" | "amber" | "red" }) {
  const color = tone === "green" ? "text-[#16A34A]" : tone === "amber" ? "text-[#D97706]" : "text-[#E8341C]";
  return (
    <div className="rounded-lg bg-[#F4F6F9] border border-[#E8ECF2] px-3 py-2.5">
      <div className={`text-2xl font-display font-bold ${color}`}>{free}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
      <div className="text-[11px] text-muted-foreground/80">{free} free / {total}</div>
    </div>
  );
}

export function HospitalCard({ h }: { h: Hospital }) {
  const status = statusFromIcu(h.icu_available);
  const badge =
    status === "green" ? { dot: "bg-[#16A34A]", text: "text-[#16A34A]", bg: "bg-[#16A34A]/10", label: "Beds available" } :
    status === "amber" ? { dot: "bg-[#D97706]", text: "text-[#D97706]", bg: "bg-[#D97706]/10", label: "Limited beds" } :
                         { dot: "bg-[#E8341C]", text: "text-[#E8341C]", bg: "bg-[#E8341C]/10", label: "ICU full" };

  const icuTone = statusFromIcu(h.icu_available);
  const genTone: "green" | "amber" | "red" = h.general_available === 0 ? "red" : h.general_available < 10 ? "amber" : "green";
  const emrTone: "green" | "amber" | "red" = h.emergency_available === 0 ? "red" : h.emergency_available < 4 ? "amber" : "green";

  const share = async () => {
    const msg = `${h.name} — ICU: ${h.icu_available}/${h.icu_total}, General: ${h.general_available}/${h.general_total}, Emergency: ${h.emergency_available}/${h.emergency_total}. Call ${h.contact}. Live via BedFinder.`;
    try {
      await navigator.clipboard.writeText(msg);
      toast.success("Copied — paste it on WhatsApp.");
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <div className="bg-white border border-[#E8ECF2] rounded-xl p-4 sm:p-5 transition-shadow hover:shadow-lg hover:shadow-black/5 fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-[#0A1628] text-base sm:text-lg leading-tight truncate">{h.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{h.distance_km} km · {h.address}</p>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <BedStat label="ICU" free={h.icu_available} total={h.icu_total} tone={icuTone} />
        <BedStat label="General" free={h.general_available} total={h.general_total} tone={genTone} />
        <BedStat label="Emergency" free={h.emergency_available} total={h.emergency_total} tone={emrTone} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">ICU last 6 hrs</div>
          <Sparkline data={h.history.slice(-6).map((p) => p.icu)} />
        </div>
        <div className="text-[11px] text-muted-foreground">Updated {minutesAgo(h.last_updated)}</div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a href={`tel:${h.contact}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-medium px-3 py-2 transition-colors">
          📞 Call
        </a>
        <button onClick={share} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-[#E8ECF2] hover:bg-[#F4F6F9] text-[#0A1628] text-sm font-medium px-3 py-2 transition-colors">
          Share
        </button>
      </div>
    </div>
  );
}
