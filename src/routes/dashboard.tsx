import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useHospitals, minutesAgo, statusFromIcu } from "@/lib/hospitals";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "City Health Dashboard — BedFinder" },
      { name: "description", content: "Live overview of hospital bed availability across the city." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const all = useHospitals();
  const [city, setCity] = useState<"Nagpur" | "Pune">("Nagpur");
  const hospitals = useMemo(() => all.filter((h) => h.city === city), [all, city]);

  const totalIcu = hospitals.reduce((s, h) => s + h.icu_available, 0);
  const totalIcuCap = hospitals.reduce((s, h) => s + h.icu_total, 0);
  const totalGen = hospitals.reduce((s, h) => s + h.general_available, 0);
  const totalEmr = hospitals.reduce((s, h) => s + h.emergency_available, 0);
  const fullCount = hospitals.filter((h) => h.icu_available === 0).length;
  const icuPctFree = totalIcuCap ? (totalIcu / totalIcuCap) * 100 : 0;
  const icuPctUsed = 100 - icuPctFree;

  const icuTone: "green" | "amber" | "red" = icuPctFree > 20 ? "green" : icuPctFree >= 10 ? "amber" : "red";
  const meterTone = icuPctUsed < 60 ? "#16A34A" : icuPctUsed <= 80 ? "#D97706" : "#E8341C";

  const [sortDesc, setSortDesc] = useState(true);
  const sorted = useMemo(() => [...hospitals].sort((a, b) => sortDesc ? b.icu_available - a.icu_available : a.icu_available - b.icu_available), [hospitals, sortDesc]);

  const chartData = useMemo(() => {
    const hours = hospitals[0]?.history.slice(-6) ?? [];
    return hours.map((_, i) => {
      const t = hospitals[0].history.slice(-6)[i].time;
      const sum = hospitals.reduce((s, h) => s + (h.history.slice(-6)[i]?.icu ?? 0), 0);
      return { time: t, icu: sum };
    });
  }, [hospitals]);

  const trendDown = chartData.length > 1 && chartData[chartData.length - 1].icu < chartData[0].icu;
  const lineColor = trendDown ? "#E8341C" : "#16A34A";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0A1628]">City Health Dashboard</h1>
            <p className="text-muted-foreground mt-2">Live overview of bed availability across government hospitals</p>
          </div>
          <div className="inline-flex rounded-lg bg-white border border-[#E8ECF2] p-1">
            {(["Nagpur", "Pune"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  city === c ? "bg-[#0A1628] text-white" : "text-[#0A1628] hover:bg-[#F4F6F9]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="ICU beds available" value={totalIcu} tone={icuTone} />
          <StatCard label="General beds available" value={totalGen} tone="green" />
          <StatCard label="Emergency beds available" value={totalEmr} tone="green" />
          <StatCard label="Hospitals at ICU full" value={fullCount} tone="red" />
        </div>

        <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display font-semibold text-[#0A1628]">City is at {icuPctUsed.toFixed(0)}% ICU capacity</h3>
            <span className="text-xs text-muted-foreground">{totalIcuCap - totalIcu} used / {totalIcuCap} ICU beds citywide</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-[#F4F6F9] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${icuPctUsed}%`, backgroundColor: meterTone }} />
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#E8ECF2]">
            <h3 className="font-display font-semibold text-[#0A1628]">Hospital status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F6F9] text-[#0A1628]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Hospital</th>
                  <th onClick={() => setSortDesc((s) => !s)} className="text-left px-4 py-3 font-medium cursor-pointer select-none">ICU {sortDesc ? "↓" : "↑"}</th>
                  <th className="text-left px-4 py-3 font-medium">General</th>
                  <th className="text-left px-4 py-3 font-medium">Emergency</th>
                  <th className="text-left px-4 py-3 font-medium">Updated</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((h) => {
                  const s = statusFromIcu(h.icu_available);
                  const c = s === "green" ? "bg-[#16A34A]/10 text-[#16A34A]" : s === "amber" ? "bg-[#D97706]/10 text-[#D97706]" : "bg-[#E8341C]/10 text-[#E8341C]";
                  const label = s === "green" ? "Available" : s === "amber" ? "Limited" : "Full";
                  return (
                    <tr key={h.id} className="border-t border-[#E8ECF2] hover:bg-[#F4F6F9]/50">
                      <td className="px-4 py-3 font-medium text-[#0A1628]">{h.name}</td>
                      <td className="px-4 py-3">{h.icu_available}/{h.icu_total}</td>
                      <td className="px-4 py-3">{h.general_available}/{h.general_total}</td>
                      <td className="px-4 py-3">{h.emergency_available}/{h.emergency_total}</td>
                      <td className="px-4 py-3 text-muted-foreground">{minutesAgo(h.last_updated)}</td>
                      <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold text-[#0A1628]">ICU Bed Availability Today</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="#E8ECF2" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8ECF2" }} />
                <Line type="monotone" dataKey="icu" stroke={lineColor} strokeWidth={2.5} dot={{ r: 3, fill: lineColor }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold text-[#0A1628]">Hospital Availability Heatmap</h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {hospitals.map((h) => {
              const s = statusFromIcu(h.icu_available);
              const bg = s === "green" ? "bg-[#16A34A]" : s === "amber" ? "bg-[#D97706]" : "bg-[#E8341C]";
              return (
                <div key={h.id} className={`${bg} text-white rounded-lg p-4`}>
                  <div className="text-sm font-semibold leading-tight">{h.name}</div>
                  <div className="text-xs opacity-90 mt-1">ICU {h.icu_available}/{h.icu_total}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "red" }) {
  const color = tone === "green" ? "text-[#16A34A]" : tone === "amber" ? "text-[#D97706]" : "text-[#E8341C]";
  return (
    <div className="bg-white border border-[#E8ECF2] rounded-xl p-4 sm:p-5">
      <div className={`font-display font-bold text-3xl sm:text-4xl ${color}`}>{value}</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
