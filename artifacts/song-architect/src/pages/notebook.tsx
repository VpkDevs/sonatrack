import { useState, useMemo, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Star, Edit2, Trash2, Plus, Tag as TagIcon, BookA } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Love", "Pain", "Addiction", "Nature", "Rebellion", "Time", "Death", "Identity", "Ambition", "War", "Faith", "Loss", "Joy", "Darkness", "Freedom", "Other"];

type NotebookEntry = {
  id: string;
  content: string;
  category: string;
  tags: string;
  source: string;
  isFavorite: boolean;
  date: string;
};

export default function Notebook() {
  const [entries, setEntries] = useLocalStorage<NotebookEntry[]>("song-architect-notebook", []);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("All");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    if (entries.length === 0) {
      setEntries([
        { id: crypto.randomUUID(), content: "I keep hearing your name in the static like a ghost that won't leave the chorus.", category: "Love", tags: "ghost imagery, chorus", source: "Midnight Demo", isFavorite: true, date: "2026-04-03T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "The room still leans when I walk in, like the walls remember every bad decision.", category: "Pain", tags: "room imagery, memory", source: "After Hours Notes", isFavorite: false, date: "2026-04-04T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "I burned the bridges just to feel the heat one more time.", category: "Addiction", tags: "fire, relapse", source: "Unfinished Verse", isFavorite: true, date: "2026-04-05T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "Your voice was a lighthouse in a storm I never planned to survive.", category: "Love", tags: "lighthouse, storm", source: "Verse Bank", isFavorite: false, date: "2026-04-06T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "I prayed for a clean break but kept calling the poison by its first name.", category: "Addiction", tags: "poison, relapse", source: "Chorus Ideas", isFavorite: true, date: "2026-04-07T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "We were two headlights cutting through the rain with nowhere to arrive.", category: "Love", tags: "highway, rain", source: "Road Song", isFavorite: false, date: "2026-04-08T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "My ribs are a locked drawer full of letters I never sent.", category: "Pain", tags: "letters, silence", source: "Notebook", isFavorite: false, date: "2026-04-09T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "I wore regret like jewelry until it became part of my shape.", category: "Addiction", tags: "regret, jewelry", source: "Hook Vault", isFavorite: true, date: "2026-04-10T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "The moon watched over us like a producer with too much patience.", category: "Nature", tags: "moon, witness", source: "Nature Sketches", isFavorite: false, date: "2026-04-11T11:00:00.000Z" },
        { id: crypto.randomUUID(), content: "I loved you like a fire loves oxygen: reckless and impossible to hold.", category: "Love", tags: "fire, love", source: "Favorite Lines", isFavorite: true, date: "2026-04-12T11:00:00.000Z" },
      ]);
    }
  }, [entries.length, setEntries]);

  const openNewDialog = () => {
    setEditingId(null);
    setContent("");
    setCategory(CATEGORIES[0]);
    setTags("");
    setSource("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (entry: NotebookEntry) => {
    setEditingId(entry.id);
    setContent(entry.content);
    setCategory(entry.category);
    setTags(entry.tags);
    setSource(entry.source);
    setIsDialogOpen(true);
  };

  const saveEntry = () => {
    if (!content.trim()) return;

    const entryData: NotebookEntry = {
      id: editingId || crypto.randomUUID(),
      content,
      category,
      tags,
      source,
      isFavorite: editingId ? (entries.find(e => e.id === editingId)?.isFavorite || false) : false,
      date: editingId ? (entries.find(e => e.id === editingId)?.date || new Date().toISOString()) : new Date().toISOString()
    };

    if (editingId) {
      setEntries(entries.map(e => e.id === editingId ? entryData : e));
    } else {
      setEntries([entryData, ...entries]);
    }
    
    setIsDialogOpen(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const toggleFav = (id: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = e.content.toLowerCase().includes(search.toLowerCase()) || e.tags.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "All" || e.category === filterCat;
      const matchFav = !showFavsOnly || e.isFavorite;
      return matchSearch && matchCat && matchFav;
    });
  }, [entries, search, filterCat, showFavsOnly]);

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rhyme Notebook</h1>
          <p className="text-muted-foreground mt-1">Collect metaphors, snippets, and phrases for future songs.</p>
        </div>
        <Button onClick={openNewDialog} className="shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Plus className="w-4 h-4 mr-2" /> Add Snippet
        </Button>
      </div>

      <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search snippets or tags..." 
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>
        
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[180px] bg-black/20 border-white/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button 
          variant={showFavsOnly ? "default" : "outline"} 
          className={cn("gap-2", !showFavsOnly && "bg-black/20 border-white/10 text-muted-foreground")}
          onClick={() => setShowFavsOnly(!showFavsOnly)}
        >
          <Star className={cn("w-4 h-4", showFavsOnly ? "fill-white" : "")} />
          Favorites
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map(entry => (
          <div key={entry.id} className="glass-card p-6 rounded-xl flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-black/80 to-transparent pb-8 pl-8">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEditDialog(entry)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-between items-start mb-4 pr-12">
              <Badge variant="outline" className="bg-white/5 font-mono text-xs">{entry.category}</Badge>
              <button onClick={() => toggleFav(entry.id)} className="transition-transform active:scale-90">
                <Star className={cn("w-5 h-5", entry.isFavorite ? "fill-secondary text-secondary" : "text-muted-foreground hover:text-white")} />
              </button>
            </div>

            <p className="font-serif text-lg leading-relaxed flex-1 whitespace-pre-wrap">{entry.content}</p>

            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
              {entry.tags && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TagIcon className="w-3 h-3" />
                  <span className="truncate">{entry.tags.split(',').map(t=>t.trim()).join(', ')}</span>
                </div>
              )}
              {entry.source && (
                <p className="text-xs text-white/40 italic">From: {entry.source}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
          <BookA className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-white mb-2">No snippets found</h3>
          <p className="text-muted-foreground">Add a new snippet or adjust your filters.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Snippet' : 'New Snippet'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <Textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="bg-black/20 min-h-[120px] font-serif text-lg resize-none" 
                placeholder="A striking metaphor, a clever rhyme..."
                autoFocus 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags (comma separated)</label>
              <Input 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                placeholder="e.g. imagery, clever, bridge" 
                className="bg-black/20" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Source Song (Optional)</label>
              <Input 
                value={source} 
                onChange={e => setSource(e.target.value)} 
                placeholder="Did you use this somewhere?" 
                className="bg-black/20" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEntry}>Save Snippet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

// Need to define BookA icon locally since lucide-react might not export it reliably in some versions, or I'll just import it. Wait, I imported it at the top. But I forgot to import it. Let me fix the imports.
