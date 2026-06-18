import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HospitalCard } from "@/components/HospitalCard";
import { useHospitals, minutesAgo } from "@/lib/hospitals";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BedFinder — Find a hospital bed right now" },
      { name: "description", content: "Real-time ICU, general and emergency bed availability across government hospitals in India." },
      { property: "og:title", content: "BedFinder — Find a hospital bed right now" },
      { property: "og:description", content: "Real-time hospital bed availability across Indian cities." },
    ],
  }),
  component: CitizenPortal,
});

type Filter = "all" | "icu" | "emergency" | "nearest";

function CitizenPortal() {
  const hospitals = useHospitals();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [phone, setPhone] = useState("");

  const lastUpdated = useMemo(
    () => Math.max(...hospitals.map((h) => h.last_updated)),
    [hospitals]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = hospitals;
    if (q) {
      list = list.filter(
        (h) => h.city.toLowerCase().includes(q) || h.pincode.includes(q) || h.name.toLowerCase().includes(q)
      );
    }
    if (filter === "icu") list = list.filter((h) => h.icu_available > 0);
    if (filter === "emergency") list = list.filter((h) => h.emergency_available > 0);
    if (filter === "nearest") list = [...list].sort((a, b) => a.distance_km - b.distance_km);
    return list;
  }, [hospitals, query, filter]);

  const totalIcu = hospitals.reduce((s, h) => s + h.icu_available, 0);
  const totalGen = hospitals.reduce((s, h) => s + h.general_available, 0);

  const cityLabel = query ? query : "all cities";

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-[#0A1628] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8341C]/15 text-[#ff8c7a] px-3 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8341C] pulse-dot" />
            LIVE — Updated every few minutes
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl mt-5 leading-[1.05]">
            Find a hospital bed <span className="text-[#E8341C]">right now.</span>
          </h1>
          <p className="text-white/70 mt-4 max-w-xl text-base sm:text-lg">
            Real-time bed availability across government hospitals in your city.
          </p>

          <div className="mt-7 bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2 sm:items-center max-w-2xl shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 px-3 flex-1">
              <span className="text-muted-foreground">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter city or pincode…"
                className="w-full bg-transparent outline-none text-[#0A1628] placeholder:text-muted-foreground py-2.5 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => toast.success(`Showing ${filtered.length} hospitals`)}
              className="bg-[#E8341C] hover:bg-[#c92614] text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Search Beds
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Nagpur", "Pune", "Mumbai", "Aurangabad"].map((c) => (
              <button
                key={c}
                onClick={() => setQuery(c)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm border border-white/10 transition-colors"
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => { setQuery("Nagpur"); toast("Using your location: Nagpur"); }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm border border-white/10 transition-colors"
            >
              📍 Use my location
            </button>
          </div>

          <Link
            to="/emergency"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#E8341C] text-[#E8341C] hover:bg-[#E8341C] hover:text-white font-semibold text-sm transition-colors"
          >
            🚨 In an emergency? Tap here
          </Link>
        </div>
      </section>

      <section className="bg-[#0F2040] text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Hospitals tracked" value={hospitals.length} />
          <Stat label="ICU beds free" value={totalIcu} accent="text-[#16A34A]" />
          <Stat label="General beds free" value={totalGen} accent="text-[#16A34A]" />
          <Stat label="Last updated" value={minutesAgo(lastUpdated)} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-[#0A1628]">{filtered.length}</span> hospitals in {cityLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", "All beds"],
              ["icu", "ICU only"],
              ["emergency", "Emergency only"],
              ["nearest", "Nearest first"],
            ] as [Filter, string][]).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === k ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-white border-[#E8ECF2] text-[#0A1628] hover:bg-[#F4F6F9]"
                }`}
              >
                {l}
              </button>
            ))}
            <button
              onClick={() => toast("Map view coming soon")}
              className="px-3 py-1.5 rounded-full text-xs font-medium border bg-white border-[#E8ECF2] text-[#0A1628] hover:bg-[#F4F6F9]"
            >
              🗺 Map view
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 text-center py-16 bg-white border border-[#E8ECF2] rounded-xl">
            <p className="text-[#0A1628] font-semibold">No hospitals match your search.</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different city or pincode.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filtered.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        )}

        <div className="mt-10 bg-[#0A1628] text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-lg">🔔 Get notified when ICU beds open</h3>
            <p className="text-white/60 text-sm mt-1">We'll text you the moment a bed opens up in your city.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="flex-1 sm:w-56 px-3 py-2.5 rounded-lg bg-white/10 placeholder:text-white/50 text-white outline-none border border-white/10 focus:border-white/30"
            />
            <button
              onClick={() => { if (phone) { toast.success("You're on the list."); setPhone(""); } else toast.error("Enter a phone number."); }}
              className="bg-[#E8341C] hover:bg-[#c92614] px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Notify me
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div>
      <div className={`font-display font-bold text-2xl ${accent ?? "text-white"}`}>{value}</div>
      <div className="text-xs text-white/60 mt-0.5">{label}</div>
    </div>
  );
}
