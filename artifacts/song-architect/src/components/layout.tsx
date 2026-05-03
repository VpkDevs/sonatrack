import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden relative selection:bg-primary/30" style={{ background: "hsl(263 60% 5%)" }}>
      {/* Ambient animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large purple orb — top left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            top: "-18vw",
            left: "-12vw",
            background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.08) 50%, transparent 75%)",
            animation: "orb-drift-a 22s ease-in-out infinite",
          }}
        />
        {/* Gold orb — bottom right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "42vw",
            height: "42vw",
            bottom: "-14vw",
            right: "-10vw",
            background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.06) 50%, transparent 75%)",
            animation: "orb-drift-b 28s ease-in-out infinite",
          }}
        />
        {/* Small purple orb — mid right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "28vw",
            height: "28vw",
            top: "30%",
            right: "5%",
            background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
            animation: "orb-drift-c 18s ease-in-out infinite",
          }}
        />
        {/* Subtle gold — top right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "20vw",
            height: "20vw",
            top: "8%",
            right: "18%",
            background: "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)",
            animation: "orb-drift-d 34s ease-in-out infinite",
          }}
        />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        <ScrollArea className="flex-1">
          <div className="container mx-auto p-6 lg:p-8 max-w-6xl">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
