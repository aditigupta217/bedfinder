import { Link, useRouterState } from "@tanstack/react-router";

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const link = (to: string, label: string, extra = "") => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        pathname === to ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/5"
      } ${extra}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-[#0A1628] sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8341C] pulse-dot" />
          </span>
          <span className="font-display font-bold text-white text-lg tracking-tight">BedFinder</span>
        </Link>
        <nav className="flex items-center gap-1">
          {link("/", "For Citizens")}
          <Link
            to="/emergency"
            className="px-3 py-1.5 rounded-md text-sm font-semibold text-white blink-emergency hidden sm:inline-block"
          >
            Emergency
          </Link>
          {link("/dashboard", "City Dashboard", "hidden md:inline-block")}
          {link("/hospital", "Hospital Login", "hidden md:inline-block")}
        </nav>
      </div>
    </header>
  );
}
