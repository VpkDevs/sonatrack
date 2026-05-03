import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] mix-blend-screen" />
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
