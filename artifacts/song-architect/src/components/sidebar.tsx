import { Link, useLocation } from "wouter";
import { Music, LayoutTemplate, Mic2, Disc3, Music4, Lightbulb, BookHeadphones, BookA } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Structure", icon: LayoutTemplate },
  { href: "/lyrics", label: "Lyrics", icon: Mic2 },
  { href: "/album", label: "Album", icon: Disc3 },
  { href: "/chords", label: "Chords", icon: Music4 },
  { href: "/inspiration", label: "Inspiration", icon: Lightbulb },
  { href: "/journal", label: "Journal", icon: BookHeadphones },
  { href: "/notebook", label: "Notebook", icon: BookA },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 h-full border-r border-white/5 flex flex-col z-20 relative" style={{ background: "rgba(10,6,24,0.72)", backdropFilter: "blur(24px)" }}>
      {/* Sidebar inner glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.06) 0%, transparent 50%, rgba(245,158,11,0.04) 100%)" }} />

      {/* Logo */}
      <div className="p-6 flex items-center gap-3 relative">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg relative"
          style={{ background: "linear-gradient(135deg, hsl(262,83%,58%), hsl(38,92%,50%))", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
        >
          <Music className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Song Architect
        </span>
      </div>

      <div className="px-4 pb-3">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-white"
                )}
                style={isActive ? {
                  background: "linear-gradient(90deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.08) 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(124,58,237,0.3), 0 2px 12px rgba(124,58,237,0.15)"
                } : {}}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "rgba(255,255,255,0.04)" }} />
                )}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: "linear-gradient(180deg, hsl(262,83%,68%), hsl(38,92%,60%))" }} />
                )}
                <item.icon
                  className={cn("w-4.5 h-4.5 shrink-0 transition-all duration-200", isActive ? "text-primary scale-110" : "group-hover:scale-105")}
                  style={{ width: "1.1rem", height: "1.1rem" }}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      <div className="p-4">
        <div className="text-xs text-muted-foreground/40 text-center font-mono tracking-widest">v1.0.0</div>
      </div>
    </div>
  );
}
