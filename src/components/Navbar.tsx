import { Link, useRouterState } from "@tanstack/react-router";
import { useLanguage } from "../context/LanguageContext";

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language, setLanguage, t } = useLanguage();

  const link = (to: string, labelKey: string, extra = "") => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        pathname === to
          ? "text-white bg-white/10"
          : "text-white/80 hover:text-white hover:bg-white/5"
      } ${extra}`}
    >
      {t(labelKey)}
    </Link>
  );

  return (
    <header className="bg-[#0A1628] sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8341C] pulse-dot" />
          </span>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            BedFinder
          </span>
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          <nav className="flex items-center gap-1">
            {link("/", "For Citizens")}
            <Link
              to="/emergency"
              className="px-3 py-1.5 rounded-md text-sm font-semibold text-white blink-emergency hidden sm:inline-block"
            >
              {t("Emergency")}
            </Link>
            {link("/dashboard", "City Dashboard", "hidden md:inline-block")}
            {link("/hospital", "Hospital Login", "hidden md:inline-block")}
          </nav>

          {/* Language Switcher */}
          <div className="inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5 shrink-0 select-none">
            <button
              onClick={() => setLanguage("en")}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold transition-colors ${
                language === "en"
                  ? "bg-[#0A1628] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold transition-colors ${
                language === "hi"
                  ? "bg-[#0A1628] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              हिं
            </button>
            <button
              onClick={() => setLanguage("mr")}
              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold transition-colors ${
                language === "mr"
                  ? "bg-[#0A1628] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              मर
            </button>
          </div>

          {/* Pulse Ambulance Button */}
          <a
            href="tel:108"
            className="bg-[#E8341C] hover:bg-[#c92614] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 pulse-btn transition-colors shrink-0"
          >
            🚑 Call 108
          </a>
        </div>
      </div>
    </header>
  );
}
