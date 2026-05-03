import { useState, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, GripVertical, Trash2, Download, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  type: string;
  name: string;
  bars: number;
  notes: string;
  color: string;
};

const SECTION_TYPES = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro", "Hook", "Drop", "Breakdown"];
const COLORS = [
  "bg-blue-500/20 border-blue-500/40 text-blue-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-300",
  "bg-pink-500/20 border-pink-500/40 text-pink-300",
  "bg-rose-500/20 border-rose-500/40 text-rose-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-300",
  "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  "bg-green-500/20 border-green-500/40 text-green-300",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
];

const SAMPLE_SECTIONS: Section[] = [
  { id: "s1", type: "Intro", name: "Intro", bars: 4, color: COLORS[1], notes: "Sparse piano, reverb-heavy. Establish the key mood." },
  { id: "s2", type: "Verse", name: "Verse 1", bars: 8, color: COLORS[0], notes: "Intimate vocals, minimal drums. Introduce the story." },
  { id: "s3", type: "Pre-Chorus", name: "Pre-Chorus", bars: 4, color: COLORS[7], notes: "Build tension. Harmonies come in on the last two bars." },
  { id: "s4", type: "Chorus", name: "Chorus", bars: 8, color: COLORS[2], notes: "Full arrangement hits. Hook repeated twice. Big drums." },
  { id: "s5", type: "Verse", name: "Verse 2", bars: 8, color: COLORS[0], notes: "Deepen the narrative. Add a new layer (guitar or synth)." },
  { id: "s6", type: "Pre-Chorus", name: "Pre-Chorus", bars: 4, color: COLORS[7], notes: "Same as first, but double the harmonies." },
  { id: "s7", type: "Chorus", name: "Chorus", bars: 8, color: COLORS[2], notes: "Repeat chorus. Increase energy slightly." },
  { id: "s8", type: "Bridge", name: "Bridge", bars: 8, color: COLORS[4], notes: "Half-time feel. Strip everything back to lead vocal + pad." },
  { id: "s9", type: "Chorus", name: "Final Chorus", bars: 8, color: COLORS[2], notes: "Key change up a half-step. Full power. Add choir/backing vox." },
  { id: "s10", type: "Outro", name: "Outro", bars: 4, color: COLORS[6], notes: "Fade out slowly. Piano mirrors the intro." },
];

export default function Structure() {
  const [sections, setSections] = useLocalStorage<Section[]>("song-architect-structure", []);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (sections.length === 0) {
      setSections(SAMPLE_SECTIONS);
    }
  }, [sections.length, setSections]);

  const addSection = (type: string) => {
    const colorIdx = sections.length % COLORS.length;
    setSections([...sections, {
      id: crypto.randomUUID(),
      type,
      name: type,
      bars: 8,
      notes: "",
      color: COLORS[colorIdx]
    }]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedIdx];
    newSections.splice(draggedIdx, 1);
    newSections.splice(index, 0, draggedItem);
    setSections(newSections);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const exportStructure = () => {
    const lines = sections.map((s, i) =>
      `[${i + 1}] ${s.name} — ${s.bars} bars${s.notes ? `\n    ${s.notes}` : ''}`
    ).join('\n\n');
    const text = `SONG STRUCTURE\n${'='.repeat(40)}\nTotal: ${totalBars} bars\n\n${lines}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'song-structure.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalBars = sections.reduce((acc, s) => acc + s.bars, 0);

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Structure Builder</h1>
          <p className="text-muted-foreground mt-1">Drag blocks to reorder. Click a section type to add it.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-secondary font-semibold">
            {totalBars} bars total
          </div>
          <Button variant="outline" onClick={exportStructure} className="gap-2 border-white/15 hover:border-secondary/50 hover:text-secondary" data-testid="btn-export">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTION_TYPES.map(type => (
          <Button
            key={type}
            variant="secondary"
            size="sm"
            onClick={() => addSection(type)}
            className="bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/40 transition-all"
            data-testid={`btn-add-${type}`}
          >
            <Plus className="w-3 h-3 mr-1" />
            {type}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={cn(
              "rounded-xl border-2 transition-all duration-200 select-none",
              section.color,
              draggedIdx === idx
                ? "opacity-30 scale-[0.97] shadow-none"
                : "opacity-100 shadow-lg",
              dragOverIdx === idx && draggedIdx !== idx
                ? "scale-[1.02] shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                : ""
            )}
            data-testid={`section-${section.id}`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className="mt-3 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/80 transition-colors shrink-0"
                data-testid={`drag-${section.id}`}
              >
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3 space-y-2">
                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    className="font-bold bg-black/30 border-white/10 text-white placeholder:text-white/30"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={64}
                      value={section.bars}
                      onChange={(e) => updateSection(section.id, { bars: parseInt(e.target.value) || 8 })}
                      className="w-20 bg-black/30 border-white/10 font-mono"
                    />
                    <span className="text-sm opacity-60">bars</span>
                  </div>
                </div>

                <div className="md:col-span-8">
                  <Textarea
                    placeholder="Notes for this section..."
                    value={section.notes}
                    onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                    className="h-full min-h-[72px] bg-black/30 border-white/10 resize-none text-sm"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(section.id)}
                    className="text-white/20 hover:text-red-400 hover:bg-red-500/10"
                    data-testid={`btn-delete-${section.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
            <LayoutTemplate className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No sections yet</h3>
            <p className="text-muted-foreground">Click a section type above to start building.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
