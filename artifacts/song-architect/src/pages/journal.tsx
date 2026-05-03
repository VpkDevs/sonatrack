import { useState, useMemo } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, ExternalLink, ArrowUpDown } from "lucide-react";

type SongStatus = "Idea" | "Demo" | "Arranged" | "Mixed" | "Mastered" | "Released";

type SongEntry = {
  id: string;
  title: string;
  bpm: number;
  key: string;
  mood: string;
  genre: string;
  status: SongStatus;
  link: string;
  dateAdded: string;
};

const KEYS = ["C Major", "C Minor", "C# Major", "C# Minor", "D Major", "D Minor", "D# Major", "D# Minor", "E Major", "E Minor", "F Major", "F Minor", "F# Major", "F# Minor", "G Major", "G Minor", "G# Major", "G# Minor", "A Major", "A Minor", "A# Major", "A# Minor", "B Major", "B Minor"];
const STATUSES: SongStatus[] = ["Idea", "Demo", "Arranged", "Mixed", "Mastered", "Released"];
const GENRES = ["Pop", "Hip-Hop", "R&B", "EDM", "Rock", "Metal", "Jazz", "Blues", "Country", "Folk", "Classical", "Reggae", "Latin", "K-Pop", "Indie", "Alternative", "Soul"];

const STATUS_COLORS: Record<SongStatus, string> = {
  "Idea": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "Demo": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Arranged": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Mixed": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Mastered": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Released": "bg-primary/20 text-primary border-primary/30"
};

export default function Journal() {
  const [songs, setSongs] = useLocalStorage<SongEntry[]>("song-architect-journal", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<keyof SongEntry>("dateAdded");
  const [sortAsc, setSortAsc] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("120");
  const [key, setKey] = useState(KEYS[0]);
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [status, setStatus] = useState<SongStatus>("Idea");
  const [link, setLink] = useState("");

  const openNewDialog = () => {
    setEditingId(null);
    setTitle("");
    setBpm("120");
    setKey(KEYS[0]);
    setMood("");
    setGenre(GENRES[0]);
    setStatus("Idea");
    setLink("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (song: SongEntry) => {
    setEditingId(song.id);
    setTitle(song.title);
    setBpm(song.bpm.toString());
    setKey(song.key);
    setMood(song.mood);
    setGenre(song.genre);
    setStatus(song.status);
    setLink(song.link || "");
    setIsDialogOpen(true);
  };

  const saveSong = () => {
    if (!title.trim()) return;

    const songData: SongEntry = {
      id: editingId || crypto.randomUUID(),
      title,
      bpm: parseInt(bpm) || 120,
      key,
      mood,
      genre,
      status,
      link,
      dateAdded: editingId ? (songs.find(s => s.id === editingId)?.dateAdded || new Date().toISOString()) : new Date().toISOString()
    };

    if (editingId) {
      setSongs(songs.map(s => s.id === editingId ? songData : s));
    } else {
      setSongs([songData, ...songs]);
    }
    
    setIsDialogOpen(false);
  };

  const deleteSong = (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
  };

  const handleSort = (field: keyof SongEntry) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [songs, sortField, sortAsc]);

  // Stats
  const avgBpm = songs.length ? Math.round(songs.reduce((acc, s) => acc + s.bpm, 0) / songs.length) : 0;
  
  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Journal</h1>
          <p className="text-muted-foreground mt-1">Track the BPM, Key, and status of every song you write.</p>
        </div>
        <Button onClick={openNewDialog} className="shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Plus className="w-4 h-4 mr-2" /> Log New Song
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Songs</p>
          <p className="text-2xl font-bold">{songs.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Avg BPM</p>
          <p className="text-2xl font-bold">{avgBpm}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{songs.filter(s => ["Mastered", "Released"].includes(s.status)).length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-secondary">{songs.filter(s => !["Mastered", "Released"].includes(s.status)).length}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="cursor-pointer text-white" onClick={() => handleSort("title")}>
                  <div className="flex items-center">Title <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer text-white" onClick={() => handleSort("bpm")}>
                  <div className="flex items-center">BPM <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer text-white" onClick={() => handleSort("key")}>
                  <div className="flex items-center">Key <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer text-white hidden md:table-cell" onClick={() => handleSort("genre")}>
                  <div className="flex items-center">Genre <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer text-white hidden lg:table-cell" onClick={() => handleSort("mood")}>
                  <div className="flex items-center">Mood <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer text-white" onClick={() => handleSort("status")}>
                  <div className="flex items-center">Status <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" /></div>
                </TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSongs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No songs logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSongs.map((song) => (
                  <TableRow key={song.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium text-white">{song.title}</TableCell>
                    <TableCell className="font-mono text-sm">{song.bpm}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-black/30 font-mono font-normal">
                        {song.key}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{song.genre}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{song.mood}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[song.status]}>
                        {song.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {song.link && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" asChild>
                            <a href={song.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEditDialog(song)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteSong(song.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Song Log' : 'Log New Song'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/20" autoFocus />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BPM</label>
                <Input type="number" value={bpm} onChange={e => setBpm(e.target.value)} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Key</label>
                <Select value={key} onValueChange={setKey}>
                  <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(val) => setStatus(val as SongStatus)}>
                  <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mood (Optional)</label>
              <Input value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g. Dark, Upbeat" className="bg-black/20" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Demo/Reference Link (Optional)</label>
              <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="bg-black/20" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSong}>Save Log</Button>
          </div>
        </DialogContent>
      </Dialog>

    </PageTransition>
  );
}
