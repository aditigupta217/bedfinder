import { useSyncExternalStore } from "react";

export type HistoryPoint = { time: string; icu: number; general: number; emergency: number };

export type Hospital = {
  id: string;
  name: string;
  city: string;
  pincode: string;
  address: string;
  distance_km: number;
  contact: string;
  icu_available: number;
  icu_total: number;
  general_available: number;
  general_total: number;
  emergency_available: number;
  emergency_total: number;
  last_updated: number;
  pin: string;
  history: HistoryPoint[];
};

const HOURS = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"];

const mkHistory = (icu: number[], gen: number[], emr: number[]): HistoryPoint[] =>
  HOURS.map((t, i) => ({ time: t, icu: icu[i], general: gen[i], emergency: emr[i] }));

const now = () => Date.now();

const seed: Hospital[] = [
  {
    id: "ngp-gmc",
    name: "Govt. Medical College & Hospital",
    city: "Nagpur",
    pincode: "440003",
    address: "Hanuman Nagar, Nagpur",
    distance_km: 1.2,
    contact: "+910712-2701000",
    icu_available: 12, icu_total: 30,
    general_available: 47, general_total: 120,
    emergency_available: 8, emergency_total: 20,
    last_updated: now() - 5 * 60 * 1000,
    pin: "1234",
    history: mkHistory([18, 16, 15, 12, 13, 12], [60, 55, 52, 50, 48, 47], [12, 11, 10, 9, 8, 8]),
  },
  {
    id: "ngp-igh",
    name: "Indira Gandhi Govt. Hospital",
    city: "Nagpur",
    pincode: "440018",
    address: "Mayo Road, Nagpur",
    distance_km: 3.8,
    contact: "+910712-2722711",
    icu_available: 2, icu_total: 20,
    general_available: 18, general_total: 80,
    emergency_available: 3, emergency_total: 15,
    last_updated: now() - 12 * 60 * 1000,
    pin: "5678",
    history: mkHistory([6, 5, 4, 4, 3, 2], [30, 27, 24, 22, 20, 18], [7, 6, 5, 4, 3, 3]),
  },
  {
    id: "ngp-mayo",
    name: "Mayo Hospital",
    city: "Nagpur",
    pincode: "440018",
    address: "Central Avenue, Nagpur",
    distance_km: 5.1,
    contact: "+910712-2726701",
    icu_available: 0, icu_total: 25,
    general_available: 31, general_total: 100,
    emergency_available: 5, emergency_total: 18,
    last_updated: now() - 25 * 60 * 1000,
    pin: "9012",
    history: mkHistory([4, 3, 3, 2, 1, 0], [40, 38, 36, 34, 32, 31], [9, 8, 7, 6, 5, 5]),
  },
  {
    id: "pn-sassoon",
    name: "Sassoon General Hospital",
    city: "Pune",
    pincode: "411001",
    address: "Sassoon Road, Pune",
    distance_km: 1.0,
    contact: "+910202-6128000",
    icu_available: 8, icu_total: 40,
    general_available: 60, general_total: 150,
    emergency_available: 10, emergency_total: 25,
    last_updated: now() - 3 * 60 * 1000,
    pin: "3456",
    history: mkHistory([14, 13, 12, 10, 9, 8], [80, 76, 72, 68, 64, 60], [16, 15, 13, 12, 11, 10]),
  },
  {
    id: "pn-naidu",
    name: "Naidu Hospital",
    city: "Pune",
    pincode: "411001",
    address: "Naidu Road, Pune",
    distance_km: 2.5,
    contact: "+910202-6126000",
    icu_available: 0, icu_total: 15,
    general_available: 22, general_total: 60,
    emergency_available: 2, emergency_total: 12,
    last_updated: now() - 45 * 60 * 1000,
    pin: "7890",
    history: mkHistory([5, 4, 3, 2, 1, 0], [35, 32, 30, 28, 25, 22], [6, 5, 4, 3, 2, 2]),
  },
  {
    id: "pn-kem",
    name: "KEM Hospital",
    city: "Pune",
    pincode: "411011",
    address: "Rasta Peth, Pune",
    distance_km: 4.2,
    contact: "+910266-3623333",
    icu_available: 15, icu_total: 35,
    general_available: 80, general_total: 200,
    emergency_available: 12, emergency_total: 30,
    last_updated: now() - 8 * 60 * 1000,
    pin: "2345",
    history: mkHistory([10, 11, 12, 13, 14, 15], [70, 72, 74, 76, 78, 80], [8, 9, 10, 11, 12, 12]),
  },
];

let state: Hospital[] = seed.map((h) => ({ ...h, history: [...h.history] }));
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const hospitalsStore = {
  getSnapshot: () => state,
  getServerSnapshot: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  update: (id: string, icu: number, general: number, emergency: number) => {
    state = state.map((h) => {
      if (h.id !== id) return h;
      const ts = Date.now();
      const time = new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
      return {
        ...h,
        icu_available: icu,
        general_available: general,
        emergency_available: emergency,
        last_updated: ts,
        history: [...h.history, { time, icu, general, emergency }].slice(-12),
      };
    });
    notify();
  },
};

export function useHospitals() {
  return useSyncExternalStore(hospitalsStore.subscribe, hospitalsStore.getSnapshot, hospitalsStore.getServerSnapshot);
}

export function statusFromIcu(icu: number): "green" | "amber" | "red" {
  if (icu === 0) return "red";
  if (icu <= 5) return "amber";
  return "green";
}

export function minutesAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diff < 1) return "just now";
  if (diff === 1) return "1 min ago";
  if (diff < 60) return `${diff} mins ago`;
  const h = Math.floor(diff / 60);
  return h === 1 ? "1 hr ago" : `${h} hrs ago`;
}
