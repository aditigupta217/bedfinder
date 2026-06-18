import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { hospitalsStore, useHospitals, minutesAgo, type Hospital } from "@/lib/hospitals";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital")({
  head: () => ({
    meta: [
      { title: "Hospital Portal — BedFinder" },
      { name: "description", content: "Hospital staff update bed availability in real time." },
    ],
  }),
  component: HospitalPortal,
});

function HospitalPortal() {
  const hospitals = useHospitals();
  const [authedId, setAuthedId] = useState<string | null>(null);
  const hospital = useMemo(() => hospitals.find((h) => h.id === authedId) ?? null, [hospitals, authedId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      {!hospital ? (
        <LoginCard hospitals={hospitals} onAuth={setAuthedId} />
      ) : (
        <StaffDashboard hospital={hospital} onSignOut={() => setAuthedId(null)} />
      )}
    </div>
  );
}

function LoginCard({ hospitals, onAuth }: { hospitals: Hospital[]; onAuth: (id: string) => void }) {
  const [id, setId] = useState(hospitals[0]?.id ?? "");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [err, setErr] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const submit = () => {
    const h = hospitals.find((x) => x.id === id);
    if (!h) return;
    if (pin.join("") === h.pin) {
      setErr("");
      toast.success(`Signed in as ${h.name}`);
      onAuth(h.id);
    } else {
      setErr("Incorrect PIN. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-[#E8ECF2] rounded-2xl p-6 sm:p-8 shadow-sm fade-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8341C]/10 text-[#E8341C] px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Hospital Staff Only
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0A1628] mt-3">Hospital Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to update live bed counts.</p>

        <label className="block text-xs font-medium text-[#0A1628] mt-6 mb-1.5">Hospital</label>
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full bg-white border border-[#E8ECF2] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0A1628]"
        >
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
          ))}
        </select>

        <label className="block text-xs font-medium text-[#0A1628] mt-5 mb-1.5">PIN</label>
        <div className="flex gap-2">
          {pin.map((v, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={v}
              maxLength={1}
              inputMode="numeric"
              onChange={(e) => {
                const next = [...pin];
                next[i] = e.target.value.replace(/\D/g, "").slice(0, 1);
                setPin(next);
                if (next[i] && i < 3) refs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !pin[i] && i > 0) refs.current[i - 1]?.focus();
                if (e.key === "Enter") submit();
              }}
              className="w-14 h-14 text-center text-xl font-semibold bg-white border border-[#E8ECF2] rounded-lg outline-none focus:border-[#0A1628]"
            />
          ))}
        </div>

        {err && <p className="text-xs text-[#E8341C] mt-2">{err}</p>}

        <button
          onClick={submit}
          className="mt-6 w-full bg-[#0A1628] hover:bg-[#15233f] text-white font-medium py-3 rounded-lg transition-colors"
        >
          Sign in →
        </button>
        <p className="text-[11px] text-muted-foreground mt-3">Demo PINs are listed in the seed data (e.g. 1234, 5678…).</p>
      </div>
    </div>
  );
}

type LogEntry = { ts: number; icu: number; general: number; emergency: number };

function StaffDashboard({ hospital, onSignOut }: { hospital: Hospital; onSignOut: () => void }) {
  const [icu, setIcu] = useState(hospital.icu_available);
  const [gen, setGen] = useState(hospital.general_available);
  const [emr, setEmr] = useState(hospital.emergency_available);
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    setIcu(hospital.icu_available);
    setGen(hospital.general_available);
    setEmr(hospital.emergency_available);
  }, [hospital.id]);

  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

  const stale = Date.now() - hospital.last_updated > 2 * 60 * 60 * 1000;

  const save = () => {
    hospitalsStore.update(hospital.id, icu, gen, emr);
    setLog((l) => [{ ts: Date.now(), icu, general: gen, emergency: emr }, ...l]);
    toast.success("Saved! Citizens can see updated counts.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0A1628]">{hospital.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">ID: {hospital.id} · {hospital.city}</p>
        </div>
        <button onClick={onSignOut} className="text-sm text-[#0A1628] hover:underline">Sign out</button>
      </div>

      {stale && (
        <div className="mt-4 bg-[#D97706]/10 border border-[#D97706]/30 text-[#92400e] rounded-lg px-4 py-3 text-sm">
          ⚠ Last update was more than 2 hours ago. Please refresh counts.
        </div>
      )}

      <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl p-5 sm:p-6 fade-up">
        <h3 className="font-display font-semibold text-[#0A1628]">Update bed availability</h3>
        <p className="text-xs text-muted-foreground mt-1">Last updated {minutesAgo(hospital.last_updated)}</p>

        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          <Counter label="ICU" value={icu} setValue={(v) => setIcu(clamp(v, hospital.icu_total))} total={hospital.icu_total} />
          <Counter label="General" value={gen} setValue={(v) => setGen(clamp(v, hospital.general_total))} total={hospital.general_total} />
          <Counter label="Emergency" value={emr} setValue={(v) => setEmr(clamp(v, hospital.emergency_total))} total={hospital.emergency_total} />
        </div>

        <button
          onClick={save}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          ✓ Save — go live now
        </button>
      </div>

      <div className="mt-6 bg-white border border-[#E8ECF2] rounded-xl p-5 sm:p-6">
        <h3 className="font-display font-semibold text-[#0A1628]">Today's update history</h3>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-3">No updates yet this session.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#E8ECF2]">
            {log.map((e, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-[#0A1628] font-medium">
                  ICU {e.icu} · Gen {e.general} · Emr {e.emergency}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Counter({ label, value, setValue, total }: { label: string; value: number; setValue: (v: number) => void; total: number }) {
  return (
    <div className="bg-[#F4F6F9] border border-[#E8ECF2] rounded-xl p-4">
      <div className="text-xs text-muted-foreground">{label} (max {total})</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button onClick={() => setValue(value - 1)} className="h-10 w-10 rounded-lg bg-white border border-[#E8ECF2] hover:bg-[#F4F6F9] text-lg font-semibold text-[#0A1628]">−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value || "0", 10))}
          className="w-full text-center text-2xl font-display font-bold text-[#0A1628] bg-transparent outline-none"
        />
        <button onClick={() => setValue(value + 1)} className="h-10 w-10 rounded-lg bg-white border border-[#E8ECF2] hover:bg-[#F4F6F9] text-lg font-semibold text-[#0A1628]">+</button>
      </div>
    </div>
  );
}
