import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHospitals } from "@/lib/hospitals";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency — BedFinder" },
      { name: "description", content: "The nearest hospital with available ICU beds. One tap to call." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const hospitals = useHospitals();
  const sorted = useMemo(() => [...hospitals].sort((a, b) => b.icu_available - a.icu_available), [hospitals]);
  const best = sorted[0];
  const others = sorted.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8341C] pulse-dot" />
          <span className="uppercase tracking-wider text-xs font-semibold">Emergency Mode</span>
        </div>
        <p className="text-white/60 text-sm mt-1.5">Showing nearest hospital with available beds</p>

        <div className="mt-8 bg-white text-[#0A1628] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#E8341C]/30 ring-1 ring-[#E8341C]/30 fade-up">
          <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">{best.name}</h2>
          <p className="text-muted-foreground text-sm mt-1.5">{best.address} · {best.distance_km} km away</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <BigStat label="ICU" value={best.icu_available} tone="green" />
            <BigStat label="General" value={best.general_available} tone="green" />
            <BigStat label="Emergency" value={best.emergency_available} tone="amber" />
          </div>

          <a
            href={`tel:${best.contact}`}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8341C] hover:bg-[#c92614] text-white font-bold py-5 text-xl sm:text-2xl transition-colors"
          >
            📞 CALL NOW
          </a>

          <Link to="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-[#0A1628]">
            or see all hospitals →
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">Other options nearby</h3>
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              {others.map((h) => (
                <div key={h.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="font-semibold text-sm leading-tight">{h.name}</div>
                  <div className="text-xs text-white/60 mt-1">ICU: <span className="text-[#16A34A] font-semibold">{h.icu_available}</span>/{h.icu_total} · {h.distance_km} km</div>
                  <a href={`tel:${h.contact}`} className="mt-3 inline-flex w-full justify-center bg-[#E8341C] hover:bg-[#c92614] text-white text-sm font-medium py-2 rounded-md">
                    📞 Call
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BigStat({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "red" }) {
  const color = tone === "green" ? "text-[#16A34A]" : tone === "amber" ? "text-[#D97706]" : "text-[#E8341C]";
  return (
    <div className="rounded-xl bg-[#F4F6F9] border border-[#E8ECF2] p-4 text-center">
      <div className={`font-display font-bold text-3xl sm:text-4xl ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
