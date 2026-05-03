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
    <div className="w-64 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Music className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          Song Architect
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group relative overflow-hidden",
                  isActive 
                    ? "text-white bg-white/10" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110 text-primary" : "group-hover:scale-110")} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="text-xs text-muted-foreground/50 text-center font-mono">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
