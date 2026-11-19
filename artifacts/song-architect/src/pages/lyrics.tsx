import { useState, useMemo } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { analyzeRhymeScheme, findRhymes } from "@/lib/song-utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const SCHEME_COLORS = [
  "bg-violet-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500",
  "bg-emerald-500", "bg-orange-500", "bg-blue-500", "bg-rose-500"
];

const DEFAULT_LYRICS = `I've been running from the ghost of who I was
Every mirror shows a face that's never done enough
The city lights don't sleep the way I do
Still chasing something that feels like truth

I wrote your name in neon on the wall
Thought that brightness could outlast the fall
But gold fades faster when it's left in rain
And I keep coming back to start again`;

export default function Lyrics() {
  const [lyrics, setLyrics] = useLocalStorage("song-architect-lyrics", DEFAULT_LYRICS);
  const [searchWord, setSearchWord] = useState("");
  const [copied, setCopied] = useState(false);

  const { lines, scheme } = useMemo(() => analyzeRhymeScheme(lyrics), [lyrics]);

  const searchResults = useMemo(() => findRhymes(searchWord), [searchWord]);

  const copyLyrics = () => {
    if (!navigator.clipboard?.writeText) return;
    void navigator.clipboard
      .writeText(lyrics)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Ignore clipboard denial on non-secure contexts
      });
  };

  const letterColors: Record<string, string> = {};
  scheme.forEach((letter) => {
    if (letter && !letterColors[letter]) {
      const idx = Object.keys(letterColors).length % SCHEME_COLORS.length;
      letterColors[letter] = SCHEME_COLORS[idx];
    }
  });

  return (
    <PageTransition className="flex flex-col space-y-6" style={{ height: "calc(100vh - 5rem)" }}>
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lyric Workshop</h1>
          <p className="text-muted-foreground mt-1">Write, analyze rhyme schemes, and find the perfect word.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLyrics(DEFAULT_LYRICS)}
            className="text-xs gap-1.5 text-muted-foreground hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyLyrics}
            className="text-xs gap-1.5 border-white/10 hover:border-secondary/50"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy Lyrics"}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-white/8" style={{ background: "rgba(20,12,40,0.7)" }}>
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor</span>
            <span className="text-xs text-muted-foreground/50 font-mono">{lines.length} lines</span>
          </div>
          <Textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-6 text-base leading-8 font-serif"
            placeholder="Start writing lyrics here..."
            data-testid="textarea-lyrics"
          />
        </div>

        {/* Analysis Pane */}
        <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Rhyme Scheme */}
          <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-white/8 min-h-0" style={{ background: "rgba(20,12,40,0.7)" }}>
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rhyme Scheme</span>
              {scheme.length > 0 && (
                <div className="flex gap-1">
                  {[...new Set(scheme.filter(Boolean))].map(letter => (
                    <span
                      key={letter}
                      className={cn("text-xs font-bold text-white px-1.5 py-0.5 rounded", letterColors[letter])}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ScrollArea className="flex-1 p-5">
              {lines.length === 0 ? (
                <p className="text-muted-foreground text-center italic mt-8 text-sm">Write something to see the rhyme scheme.</p>
              ) : (
                <div className="space-y-1.5">
                  {lines.map((line, i) => {
                    const letter = scheme[i];
                    return (
                      <div key={i} className="flex items-baseline gap-3 group">
                        <div className="w-6 shrink-0 text-right">
                          {letter && (
                            <span className={cn("text-xs font-bold text-white px-1 py-0.5 rounded", letterColors[letter])}>
                              {letter}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-serif leading-relaxed text-white/85">{line}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Rhyme Finder */}
          <div className="rounded-xl border border-white/8 shrink-0" style={{ background: "rgba(20,12,40,0.7)" }}>
            <div className="px-5 py-3 border-b border-white/5" style={{ background: "rgba(0,0,0,0.2)" }}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rhyme Finder</span>
            </div>
            <div className="p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Type any word to find rhymes…"
                  className="pl-9 bg-black/30 border-white/10 text-sm"
                  data-testid="input-rhyme-search"
                />
              </div>
              {searchResults !== null && (
                <div>
                  {searchResults.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {searchResults.map(word => (
                        <button
                          key={word}
                          className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-white/80 hover:bg-primary/15 hover:border-primary/40 hover:text-white transition-all"
                          onClick={() => setSearchWord(word)}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rhymes found in dictionary for "{searchWord}".</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
