import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, GripVertical, Trash2, Download, LayoutTemplate } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  "bg-blue-500/20 border-blue-500/30 text-blue-300",
  "bg-purple-500/20 border-purple-500/30 text-purple-300",
  "bg-pink-500/20 border-pink-500/30 text-pink-300",
  "bg-rose-500/20 border-rose-500/30 text-rose-300",
  "bg-orange-500/20 border-orange-500/30 text-orange-300",
  "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
  "bg-green-500/20 border-green-500/30 text-green-300",
  "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
];

export default function Structure() {
  const [sections, setSections] = useLocalStorage<Section[]>("song-architect-structure", []);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const addSection = (type: string) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSections([...sections, {
      id: crypto.randomUUID(),
      type,
      name: type,
      bars: 8,
      notes: "",
      color
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
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedIdx];
    newSections.splice(draggedIdx, 1);
    newSections.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setSections(newSections);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const exportStructure = () => {
    const text = sections.map(s => `[${s.name}] - ${s.bars} bars\n${s.notes ? s.notes + '\n' : ''}`).join('\n');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Structure Builder</h1>
          <p className="text-muted-foreground mt-1">Arrange your song sections and map out the journey.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono bg-white/5 px-3 py-1 rounded-md border border-white/10">
            Total: {totalBars} bars
          </div>
          <Button variant="outline" onClick={exportStructure} className="gap-2" data-testid="btn-export">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {SECTION_TYPES.map(type => (
          <Button key={type} variant="secondary" size="sm" onClick={() => addSection(type)} className="bg-white/5 hover:bg-white/10 border-white/10" data-testid={`btn-add-${type}`}>
            <Plus className="w-3 h-3 mr-1" />
            {type}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={cn(
              "glass-card p-4 rounded-xl border transition-all",
              section.color,
              draggedIdx === idx ? "opacity-50 scale-[0.98]" : "opacity-100"
            )}
            data-testid={`section-${section.id}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-2 cursor-grab active:cursor-grabbing text-white/50 hover:text-white" data-testid={`drag-${section.id}`}>
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Input 
                    value={section.name} 
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    className="font-bold bg-black/20 border-white/10 text-white"
                  />
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min={1} 
                      max={64}
                      value={section.bars}
                      onChange={(e) => updateSection(section.id, { bars: parseInt(e.target.value) || 8 })}
                      className="w-20 bg-black/20 border-white/10"
                    />
                    <span className="text-sm opacity-70">bars</span>
                  </div>
                </div>
                
                <div className="md:col-span-8">
                  <Textarea 
                    placeholder="Notes for this section (e.g. build up the drums, drop the bass...)"
                    value={section.notes}
                    onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                    className="h-full min-h-[80px] bg-black/20 border-white/10 resize-none"
                  />
                </div>
                
                <div className="md:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)} className="text-destructive hover:bg-destructive/20 hover:text-destructive" data-testid={`btn-delete-${section.id}`}>
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
            <p className="text-muted-foreground">Click a button above to start building your song structure.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
