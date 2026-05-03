import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

type EmotionalArc = "Rising" | "Peak" | "Falling" | "Valley" | "Pivot" | "Resolution";

const ARC_VALUES: Record<EmotionalArc, number> = {
  "Peak": 100,
  "Rising": 75,
  "Pivot": 50,
  "Resolution": 50,
  "Falling": 25,
  "Valley": 0,
};

type Track = {
  id: string;
  title: string;
  chapter: string;
  arc: EmotionalArc;
  themes: string;
  mood: string;
};

type AlbumProject = {
  id: string;
  name: string;
  theme: string;
  tracks: Track[];
};

export default function Album() {
  const [albums, setAlbums] = useLocalStorage<AlbumProject[]>("song-architect-albums", []);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(albums[0]?.id || null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const currentAlbum = albums.find(a => a.id === currentAlbumId) || null;

  const createAlbum = () => {
    const newAlbum: AlbumProject = {
      id: crypto.randomUUID(),
      name: "New Album Project",
      theme: "",
      tracks: []
    };
    setAlbums([...albums, newAlbum]);
    setCurrentAlbumId(newAlbum.id);
  };

  const updateCurrentAlbum = (updates: Partial<AlbumProject>) => {
    if (!currentAlbumId) return;
    setAlbums(albums.map(a => a.id === currentAlbumId ? { ...a, ...updates } : a));
  };

  const addTrack = () => {
    if (!currentAlbum) return;
    const newTrack: Track = {
      id: crypto.randomUUID(),
      title: `Track ${currentAlbum.tracks.length + 1}`,
      chapter: "",
      arc: "Rising",
      themes: "",
      mood: ""
    };
    updateCurrentAlbum({ tracks: [...currentAlbum.tracks, newTrack] });
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    if (!currentAlbum) return;
    updateCurrentAlbum({
      tracks: currentAlbum.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const removeTrack = (id: string) => {
    if (!currentAlbum) return;
    updateCurrentAlbum({
      tracks: currentAlbum.tracks.filter(t => t.id !== id)
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index || !currentAlbum) return;

    const newTracks = [...currentAlbum.tracks];
    const draggedItem = newTracks[draggedIdx];
    newTracks.splice(draggedIdx, 1);
    newTracks.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    updateCurrentAlbum({ tracks: newTracks });
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const chartData = currentAlbum?.tracks.map((t, i) => ({
    name: `T${i + 1}`,
    fullTitle: t.title,
    arc: ARC_VALUES[t.arc],
    arcName: t.arc,
    mood: t.mood
  })) || [];

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Concept Album Planner</h1>
          <p className="text-muted-foreground mt-1">Map out the narrative and emotional journey of your project.</p>
        </div>
        <Button onClick={createAlbum} data-testid="btn-create-album">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {albums.length > 0 && (
        <div className="flex gap-2 pb-4 overflow-x-auto">
          {albums.map(album => (
            <Button 
              key={album.id}
              variant={album.id === currentAlbumId ? "default" : "secondary"}
              onClick={() => setCurrentAlbumId(album.id)}
              className={album.id !== currentAlbumId ? "bg-white/5" : ""}
            >
              {album.name}
            </Button>
          ))}
        </div>
      )}

      {currentAlbum ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Project Name</label>
                <Input 
                  value={currentAlbum.name}
                  onChange={(e) => updateCurrentAlbum({ name: e.target.value })}
                  className="text-xl font-bold bg-black/20 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Overarching Theme / Narrative</label>
                <Textarea 
                  value={currentAlbum.theme}
                  onChange={(e) => updateCurrentAlbum({ theme: e.target.value })}
                  placeholder="What is this album about? (e.g. A story about a man losing his memory)"
                  className="min-h-[100px] bg-black/20 border-white/10 resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Tracklist</h3>
                <Button variant="outline" size="sm" onClick={addTrack} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Track
                </Button>
              </div>

              {currentAlbum.tracks.map((track, idx) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "glass-card p-4 rounded-xl border border-white/5 transition-all",
                    draggedIdx === idx ? "opacity-50 scale-[0.98]" : "opacity-100"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="mt-2 cursor-grab active:cursor-grabbing text-white/30 hover:text-white">
                      <GripVertical className="w-5 h-5" />
                      <div className="text-center font-mono text-xs mt-2">{idx + 1}</div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                          value={track.title}
                          onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                          placeholder="Song Title"
                          className="font-bold bg-black/20 border-white/10"
                        />
                        <Select 
                          value={track.arc} 
                          onValueChange={(val) => updateTrack(track.id, { arc: val as EmotionalArc })}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Emotional Arc" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Peak">Peak</SelectItem>
                            <SelectItem value="Rising">Rising</SelectItem>
                            <SelectItem value="Pivot">Pivot</SelectItem>
                            <SelectItem value="Resolution">Resolution</SelectItem>
                            <SelectItem value="Falling">Falling</SelectItem>
                            <SelectItem value="Valley">Valley</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input 
                          value={track.chapter}
                          onChange={(e) => updateTrack(track.id, { chapter: e.target.value })}
                          placeholder="Chapter / Role"
                          className="text-sm bg-black/20 border-white/10"
                        />
                        <Input 
                          value={track.mood}
                          onChange={(e) => updateTrack(track.id, { mood: e.target.value })}
                          placeholder="Mood (e.g. Dark, Ethereal)"
                          className="text-sm bg-black/20 border-white/10"
                        />
                        <Input 
                          value={track.themes}
                          onChange={(e) => updateTrack(track.id, { themes: e.target.value })}
                          placeholder="Themes (comma separated)"
                          className="text-sm bg-black/20 border-white/10"
                        />
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => removeTrack(track.id)} className="text-destructive hover:bg-destructive/20 mt-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {currentAlbum.tracks.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-muted-foreground">No tracks added yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-5">
            <div className="glass-card p-6 rounded-xl sticky top-8">
              <h3 className="text-lg font-semibold mb-6">Emotional Journey</h3>
              <div className="h-[400px] w-full">
                {currentAlbum.tracks.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                      <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={12} 
                        tickMargin={10} 
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={12} 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]} 
                        tickFormatter={(val) => {
                          if (val === 100) return "Peak";
                          if (val === 75) return "High";
                          if (val === 50) return "Mid";
                          if (val === 25) return "Low";
                          if (val === 0) return "Valley";
                          return "";
                        }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="glass-card p-3 rounded-lg border border-white/10 shadow-xl">
                                <p className="font-bold">{data.fullTitle}</p>
                                <p className="text-sm text-primary">{data.arcName}</p>
                                {data.mood && <p className="text-xs text-muted-foreground mt-1">{data.mood}</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="arc" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: "hsl(var(--background))", strokeWidth: 2 }} 
                        activeDot={{ r: 8, fill: "hsl(var(--secondary))", stroke: "none" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl">
                    <p className="text-muted-foreground text-sm">Add at least two tracks to visualize the emotional arc.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5 max-w-2xl mx-auto">
          <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">Create your first concept album project to get started.</p>
          <Button onClick={createAlbum} size="lg">Create Project</Button>
        </div>
      )}
    </PageTransition>
  );
}
