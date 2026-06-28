import { useSyncExternalStore } from "react";
import emailjs from "@emailjs/browser";

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
    icu_available: 12,
    icu_total: 30,
    general_available: 47,
    general_total: 120,
    emergency_available: 8,
    emergency_total: 20,
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
    icu_available: 2,
    icu_total: 20,
    general_available: 18,
    general_total: 80,
    emergency_available: 3,
    emergency_total: 15,
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
    icu_available: 0,
    icu_total: 25,
    general_available: 31,
    general_total: 100,
    emergency_available: 5,
    emergency_total: 18,
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
    icu_available: 8,
    icu_total: 40,
    general_available: 60,
    general_total: 150,
    emergency_available: 10,
    emergency_total: 25,
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
    icu_available: 0,
    icu_total: 15,
    general_available: 22,
    general_total: 60,
    emergency_available: 2,
    emergency_total: 12,
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
    icu_available: 15,
    icu_total: 35,
    general_available: 80,
    general_total: 200,
    emergency_available: 12,
    emergency_total: 30,
    last_updated: now() - 8 * 60 * 1000,
    pin: "2345",
    history: mkHistory([10, 11, 12, 13, 14, 15], [70, 72, 74, 76, 78, 80], [8, 9, 10, 11, 12, 12]),
  },
  {
    id: "bom-kem",
    name: "KEM Hospital Mumbai",
    city: "Mumbai",
    pincode: "400012",
    address: "Acharya Donde Marg, Parel, Mumbai",
    distance_km: 2.4,
    contact: "+910222-4107000",
    icu_available: 24,
    icu_total: 50,
    general_available: 180,
    general_total: 300,
    emergency_available: 15,
    emergency_total: 40,
    last_updated: now() - 15 * 60 * 1000,
    pin: "4321",
    history: mkHistory(
      [35, 32, 28, 26, 25, 24],
      [200, 195, 190, 185, 182, 180],
      [20, 18, 16, 15, 15, 15],
    ),
  },
  {
    id: "bom-sion",
    name: "Lokmanya Tilak Municipal General Hospital (Sion Hospital)",
    city: "Mumbai",
    pincode: "400022",
    address: "Sion West, Sion, Mumbai",
    distance_km: 4.1,
    contact: "+910222-4076381",
    icu_available: 6,
    icu_total: 40,
    general_available: 110,
    general_total: 250,
    emergency_available: 8,
    emergency_total: 30,
    last_updated: now() - 18 * 60 * 1000,
    pin: "8765",
    history: mkHistory([12, 10, 9, 8, 7, 6], [130, 125, 120, 115, 112, 110], [14, 12, 10, 9, 8, 8]),
  },
  {
    id: "bom-jj",
    name: "Sir J. J. Group of Hospitals",
    city: "Mumbai",
    pincode: "400008",
    address: "J.J. Marg, Byculla, Mumbai",
    distance_km: 6.5,
    contact: "+910222-3735555",
    icu_available: 0,
    icu_total: 60,
    general_available: 85,
    general_total: 350,
    emergency_available: 4,
    emergency_total: 50,
    last_updated: now() - 2 * 60 * 1000,
    pin: "2109",
    history: mkHistory([5, 4, 3, 2, 1, 0], [120, 110, 105, 95, 90, 85], [10, 8, 7, 5, 4, 4]),
  },
  {
    id: "ixu-gmc",
    name: "Government Medical College & Hospital Aurangabad",
    city: "Aurangabad",
    pincode: "431001",
    address: "Panchakki Road, Aurangabad",
    distance_km: 1.8,
    contact: "+910240-2402412",
    icu_available: 9,
    icu_total: 25,
    general_available: 55,
    general_total: 120,
    emergency_available: 6,
    emergency_total: 20,
    last_updated: now() - 30 * 60 * 1000,
    pin: "6543",
    history: mkHistory([15, 14, 12, 11, 10, 9], [75, 70, 68, 62, 58, 55], [8, 8, 7, 6, 6, 6]),
  },
  {
    id: "ixu-dch",
    name: "District Civil Hospital Aurangabad",
    city: "Aurangabad",
    pincode: "431003",
    address: "Jalna Road, Chikalthana, Aurangabad",
    distance_km: 5.2,
    contact: "+910240-2484643",
    icu_available: 2,
    icu_total: 15,
    general_available: 38,
    general_total: 80,
    emergency_available: 3,
    emergency_total: 15,
    last_updated: now() - 10 * 60 * 1000,
    pin: "9876",
    history: mkHistory([5, 4, 4, 3, 2, 2], [48, 45, 42, 40, 39, 38], [6, 5, 4, 4, 3, 3]),
  },
  {
    id: "del-aiims",
    name: "All India Institute of Medical Sciences (AIIMS)",
    city: "Delhi",
    pincode: "110029",
    address: "Ansari Nagar, New Delhi",
    distance_km: 3.0,
    contact: "+910112-6588500",
    icu_available: 32,
    icu_total: 80,
    general_available: 240,
    general_total: 450,
    emergency_available: 18,
    emergency_total: 60,
    last_updated: now() - 22 * 60 * 1000,
    pin: "1010",
    history: mkHistory(
      [45, 42, 38, 35, 34, 32],
      [280, 272, 265, 258, 248, 240],
      [25, 22, 20, 19, 18, 18],
    ),
  },
  {
    id: "del-safd",
    name: "Safdarjung Hospital",
    city: "Delhi",
    pincode: "110029",
    address: "Ansari Nagar East, New Delhi",
    distance_km: 3.2,
    contact: "+910112-6730000",
    icu_available: 8,
    icu_total: 60,
    general_available: 130,
    general_total: 350,
    emergency_available: 5,
    emergency_total: 45,
    last_updated: now() - 40 * 60 * 1000,
    pin: "2020",
    history: mkHistory(
      [18, 16, 14, 12, 10, 8],
      [180, 172, 160, 150, 142, 130],
      [12, 10, 8, 7, 5, 5],
    ),
  },
  {
    id: "del-lnjp",
    name: "Lok Nayak Jai Prakash Narayan Hospital (LNJP)",
    city: "Delhi",
    pincode: "110002",
    address: "Jawaharlal Nehru Marg, New Delhi",
    distance_km: 7.4,
    contact: "+910112-3233260",
    icu_available: 0,
    icu_total: 50,
    general_available: 90,
    general_total: 300,
    emergency_available: 3,
    emergency_total: 40,
    last_updated: now() - 5 * 60 * 1000,
    pin: "3030",
    history: mkHistory([6, 5, 4, 2, 1, 0], [120, 112, 108, 102, 95, 90], [10, 8, 6, 5, 3, 3]),
  },
  {
    id: "blr-vic",
    name: "Victoria Hospital Bangalore",
    city: "Bangalore",
    pincode: "560002",
    address: "Kalasipalyam, near K.R. Market, Bangalore",
    distance_km: 1.5,
    contact: "+910802-6701150",
    icu_available: 18,
    icu_total: 40,
    general_available: 125,
    general_total: 250,
    emergency_available: 11,
    emergency_total: 30,
    last_updated: now() - 11 * 60 * 1000,
    pin: "4040",
    history: mkHistory(
      [25, 23, 22, 20, 19, 18],
      [150, 144, 138, 132, 128, 125],
      [16, 14, 13, 12, 11, 11],
    ),
  },
  {
    id: "blr-bow",
    name: "Bowring and Lady Curzon Hospital",
    city: "Bangalore",
    pincode: "560001",
    address: "Lady Curzon Road, Shivajinagar, Bangalore",
    distance_km: 3.8,
    contact: "+910802-5591325",
    icu_available: 4,
    icu_total: 30,
    general_available: 78,
    general_total: 180,
    emergency_available: 6,
    emergency_total: 25,
    last_updated: now() - 50 * 60 * 1000,
    pin: "5050",
    history: mkHistory([10, 9, 8, 7, 5, 4], [110, 102, 95, 90, 84, 78], [12, 10, 8, 7, 6, 6]),
  },
];

export type WaitingUser = { email: string; city: string; timestamp: number };

let waitingList: WaitingUser[] = [];

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("bedfinder_waiting_list");
    if (saved) {
      waitingList = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load waiting list", e);
  }
}

const saveWaitingList = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bedfinder_waiting_list", JSON.stringify(waitingList));
    } catch (e) {
      console.error("Failed to save waiting list", e);
    }
  }
};

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
  getWaitingList: () => waitingList,
  addToWaitingList: (email: string, city: string) => {
    if (waitingList.some((u) => u.email === email && u.city.toLowerCase() === city.toLowerCase())) {
      return;
    }
    waitingList.push({ email, city, timestamp: Date.now() });
    saveWaitingList();
    notify();
  },
  notifyWaitingUsers: (
    city: string,
    hospitalName: string,
    icu: number,
    general: number,
    emergency: number,
    contact: string,
  ) => {
    const cityUsers = waitingList.filter((u) => u.city.toLowerCase() === city.toLowerCase());
    if (cityUsers.length === 0) return 0;

    cityUsers.forEach((user) => {
      emailjs
        .send(
          "service_bedfinder",
          "template_bedfinder",
          {
            to_email: user.email,
            subject: "🏥 ICU Beds Now Available — BedFinder Alert",
            hospital_name: hospitalName,
            icu: icu,
            general: general,
            emergency: emergency,
            contact: contact,
            message: `ICU beds are now available at ${hospitalName}.\nBeds: ${icu} ICU · ${general} General · ${emergency} Emergency\nCall ${contact} now.\n— BedFinder India`,
          },
          "user_placeholder",
        )
        .then(() => {
          console.log(`Email alert sent successfully to ${user.email}`);
        })
        .catch((err) => {
          console.error(`EmailJS failed to send email to ${user.email}:`, err);
        });
    });

    // Remove notified users from waitingList
    waitingList = waitingList.filter((u) => u.city.toLowerCase() !== city.toLowerCase());
    saveWaitingList();
    notify();

    return cityUsers.length;
  },
};

export function useHospitals() {
  return useSyncExternalStore(
    hospitalsStore.subscribe,
    hospitalsStore.getSnapshot,
    hospitalsStore.getServerSnapshot,
  );
}

export function statusFromIcu(icu: number): "green" | "amber" | "red" {
  if (icu === 0) return "red";
  if (icu <= 5) return "amber";
  return "green";
}

export function minutesAgo(
  ts: number,
  t?: (key: string, replacements?: Record<string, string | number>) => string,
): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  const translate =
    t ||
    ((k, r) => {
      if (k === "just now") return "just now";
      if (k === "1 min ago") return "1 min ago";
      if (k === "mins ago") return `${r?.count} mins ago`;
      if (k === "1 hr ago") return "1 hr ago";
      if (k === "hrs ago") return `${r?.count} hrs ago`;
      return k;
    });

  if (diff < 1) return translate("just now");
  if (diff === 1) return translate("1 min ago");
  if (diff < 60) return translate("mins ago", { count: diff });
  const h = Math.floor(diff / 60);
  return h === 1 ? translate("1 hr ago") : translate("hrs ago", { count: h });
}
