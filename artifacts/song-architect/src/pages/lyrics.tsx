import { useState, useMemo, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const RHYME_FAMILIES: Record<string, string[]> = {
  "ight": ["fight", "night", "light", "right", "sight", "might", "bright", "tight", "white", "kite", "write", "bite", "cite", "quite", "sprite", "height", "flight", "blight", "knight", "plight", "slight", "trite", "smite", "ignite", "invite", "delight", "tonight", "despite"],
  "ame": ["name", "game", "same", "came", "fame", "blame", "flame", "shame", "tame", "frame", "claim", "aim", "maim", "acclaim", "proclaim"],
  "ay": ["day", "say", "way", "play", "may", "lay", "pay", "stay", "ray", "tray", "pray", "spray", "gray", "okay", "today", "stray", "sway", "away", "delay", "display", "betray"],
  "ove": ["love", "dove", "above", "glove", "shove"],
  "ine": ["line", "mine", "fine", "nine", "shine", "wine", "pine", "sign", "design", "align", "divine", "decline", "define", "incline", "resign"],
  "ong": ["song", "long", "wrong", "strong", "along", "belong", "prolong"],
  "old": ["old", "cold", "hold", "told", "gold", "sold", "fold", "bold", "scold", "behold", "withhold"],
  "eel": ["feel", "real", "deal", "heal", "steal", "meal", "wheel", "kneel", "peel", "reel", "steel", "conceal", "reveal", "appeal"],
  "ear": ["hear", "year", "clear", "tear", "fear", "near", "dear", "gear", "rear", "spear", "appear"],
  "ack": ["back", "black", "track", "lack", "pack", "stack", "crack", "attack", "hack", "jack", "sack", "tack", "whack", "knack"],
  "ound": ["sound", "around", "found", "ground", "bound", "pound", "round", "hound", "mound", "astound", "confound", "surround"],
  "ing": ["thing", "sing", "ring", "wing", "king", "spring", "bring", "swing", "cling", "fling", "sting", "string", "wring"],
  "ake": ["make", "take", "fake", "wake", "break", "shake", "lake", "snake", "cake", "bake", "ache", "brake", "flake", "quake", "sake"],
  "ate": ["late", "wait", "hate", "fate", "date", "gate", "state", "rate", "great", "straight", "crate", "grate", "plate", "skate", "slate", "weight", "create", "debate", "estate"],
  "ick": ["sick", "pick", "quick", "kick", "trick", "stick", "click", "brick", "flick", "lick", "slick", "thick", "tick"],
  "own": ["down", "town", "brown", "crown", "frown", "drown", "clown", "gown"],
  "art": ["heart", "part", "start", "art", "smart", "dart", "chart", "cart", "depart", "impart"],
  "ell": ["tell", "well", "fell", "sell", "bell", "shell", "cell", "smell", "spell", "hell", "dwell", "swell", "yell", "compel", "excel", "expel", "rebel"],
  "end": ["end", "friend", "send", "spend", "bend", "blend", "lend", "mend", "trend", "amend", "defend", "depend", "extend", "pretend", "transcend"],
  "ent": ["went", "sent", "spent", "tent", "rent", "bent", "cent", "dent", "lent", "vent", "event", "invent", "prevent", "consent"],
  "est": ["best", "rest", "test", "west", "guest", "chest", "nest", "pest", "vest", "zest", "quest", "crest", "arrest", "invest", "suggest"],
  "et": ["get", "let", "met", "set", "yet", "bet", "net", "pet", "wet", "fret", "forget", "regret", "upset"],
  "ice": ["ice", "nice", "price", "rice", "slice", "spice", "twice", "mice", "dice", "vice", "advice", "device"],
  "ife": ["life", "wife", "knife", "strife"],
  "ill": ["will", "still", "kill", "fill", "bill", "hill", "mill", "pill", "till", "chill", "drill", "grill", "skill", "spill", "thrill", "fulfill", "instill"],
  "ink": ["think", "drink", "pink", "sink", "blink", "link", "shrink", "stink", "wink"],
  "iss": ["miss", "kiss", "bliss", "hiss", "dismiss", "abyss"],
  "ive": ["live", "give", "drive", "five", "dive", "hive", "jive", "strive", "thrive", "arrive", "deprive", "derive", "revive", "survive"],
  "ock": ["rock", "block", "clock", "lock", "mock", "sock", "shock", "stock", "flock", "knock"],
  "oke": ["broke", "spoke", "woke", "smoke", "joke", "choke", "poke", "stroke", "provoke", "revoke", "invoke"],
  "oan": ["bone", "cone", "lone", "phone", "stone", "tone", "zone", "clone", "drone", "throne", "alone", "postpone"],
  "ool": ["cool", "fool", "pool", "rule", "school", "tool"],
  "oon": ["soon", "moon", "noon", "spoon", "balloon", "cartoon"],
  "ore": ["more", "before", "store", "door", "floor", "core", "score", "shore", "bore", "chore", "pore", "tore", "wore", "adore", "explore", "ignore", "restore"],
  "ose": ["those", "close", "chose", "nose", "rose", "pose", "hose", "dose", "compose", "dispose", "expose", "impose", "oppose", "propose", "suppose"],
  "ot": ["not", "got", "hot", "lot", "pot", "shot", "spot", "dot", "knot", "plot", "rot", "slot"],
  "ow": ["how", "now", "cow", "bow", "vow", "plow", "brow", "allow"],
  "oy": ["boy", "joy", "toy", "soy", "coy", "ploy", "annoy", "deploy", "destroy", "employ", "enjoy"],
  "uck": ["luck", "truck", "stuck", "duck", "buck", "chuck", "pluck", "suck", "struck", "tuck"],
  "ug": ["bug", "hug", "mug", "rug", "tug", "drug", "plug", "slug", "shrug", "smug", "snug"],
  "ull": ["full", "pull", "bull"],
  "ump": ["jump", "bump", "pump", "dump", "lump", "stump", "clump", "plump", "slump", "thump"],
  "un": ["fun", "run", "sun", "gun", "bun", "pun", "nun", "shun", "spun", "stun"],
  "unk": ["drunk", "junk", "punk", "sunk", "trunk", "chunk", "flunk", "plunk", "shrunk", "skunk"],
  "urn": ["burn", "turn", "learn", "earn", "return", "fern", "yearn"],
  "ut": ["but", "cut", "hut", "nut", "shut", "gut", "rut", "strut"],
  "ash": ["ash", "cash", "dash", "flash", "smash", "crash", "hash", "mash", "rash", "slash", "trash", "splash"],
  "eep": ["deep", "keep", "sleep", "sweep", "weep", "creep", "peep", "sheep", "steep"],
  "ead": ["dead", "bread", "head", "lead", "read", "red", "spread", "thread", "ahead", "instead", "dread"],
  "ace": ["face", "place", "race", "space", "trace", "base", "case", "chase", "grace", "pace", "lace", "replace", "embrace", "erase"],
  "ain": ["pain", "rain", "train", "brain", "chain", "drain", "gain", "main", "plain", "stain", "remain", "explain", "contain", "complain", "refrain"],
};

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

function analyzeRhymeScheme(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const endings = lines.map(l => {
    const words = l.split(/\s+/);
    return words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  });

  const scheme: string[] = [];
  const families: Record<string, string> = {};
  let nextChar = 65;

  endings.forEach(word => {
    if (!word) { scheme.push(''); return; }
    let found = false;
    for (const [fam, words] of Object.entries(RHYME_FAMILIES)) {
      if (words.includes(word) || word.endsWith(fam)) {
        if (!families[fam]) families[fam] = String.fromCharCode(nextChar++);
        scheme.push(families[fam]);
        found = true;
        break;
      }
    }
    if (!found) {
      if (!families[word]) families[word] = String.fromCharCode(nextChar++);
      scheme.push(families[word]);
    }
  });

  return { lines, scheme };
}

export default function Lyrics() {
  const [lyrics, setLyrics] = useLocalStorage("song-architect-lyrics", "");
  const [searchWord, setSearchWord] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lyrics) setLyrics(DEFAULT_LYRICS);
  }, []);

  const { lines, scheme } = useMemo(() => analyzeRhymeScheme(lyrics), [lyrics]);

  const searchResults = useMemo(() => {
    if (!searchWord) return null;
    const term = searchWord.toLowerCase().trim();
    for (const [, words] of Object.entries(RHYME_FAMILIES)) {
      if (words.includes(term)) return words.filter(w => w !== term);
    }
    for (const [fam, words] of Object.entries(RHYME_FAMILIES)) {
      if (term.endsWith(fam)) return words;
    }
    return [];
  }, [searchWord]);

  const copyLyrics = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
