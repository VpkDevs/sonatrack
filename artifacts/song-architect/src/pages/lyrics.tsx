import { useState, useMemo } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

// Simplified rhyme dictionary for demo purposes
const RHYME_FAMILIES: Record<string, string[]> = {
  "ight": ["fight", "night", "light", "right", "sight", "might", "bright", "tight", "white", "kite", "write", "bite", "cite", "quite", "sprite", "height", "flight", "blight", "knight", "plight", "slight", "trite", "smite", "ignite", "invite", "delight", "tonight", "despite"],
  "ame": ["name", "game", "same", "came", "fame", "blame", "flame", "shame", "tame", "frame", "claim", "aim", "maim", "acclaim", "proclaim"],
  "ay": ["day", "say", "way", "play", "may", "lay", "pay", "stay", "ray", "tray", "pray", "spray", "gray", "okay", "today", "stray", "sway", "away", "delay", "display", "betray"],
  "ove": ["love", "dove", "above", "glove", "shove", "cove", "rove"],
  "ine": ["line", "mine", "fine", "nine", "shine", "wine", "pine", "sign", "design", "align", "divine", "decline", "define", "incline", "resign"],
  "ong": ["song", "long", "wrong", "strong", "along", "belong", "prolong"],
  "old": ["old", "cold", "hold", "told", "gold", "sold", "fold", "bold", "scold", "behold", "withhold"],
  "eel": ["feel", "real", "deal", "heal", "steal", "meal", "wheel", "kneel", "peel", "reel", "steel", "conceal", "reveal", "appeal"],
  "ear": ["hear", "year", "clear", "tear", "fear", "near", "dear", "gear", "rear", "spear", "appear"],
  "ack": ["back", "black", "track", "lack", "pack", "stack", "crack", "attack", "hack", "jack", "sack", "tack", "whack", "knack"],
  "ound": ["sound", "around", "found", "ground", "bound", "pound", "round", "hound", "mound", "astound", "confound", "surround"],
  "ing": ["thing", "sing", "ring", "wing", "king", "spring", "bring", "swing", "cling", "fling", "sting", "string", "wring"],
  "ake": ["make", "take", "fake", "wake", "break", "shake", "lake", "snake", "cake", "bake", "ache", "brake", "flake", "quake", "sake"],
  "ate": ["late", "wait", "hate", "fate", "date", "gate", "state", "rate", "great", "straight", "crate", "grate", "plate", "skate", "slate", "trait", "weight", "create", "debate", "estate"],
  "ick": ["sick", "pick", "quick", "kick", "trick", "stick", "click", "brick", "flick", "lick", "slick", "thick", "tick"],
  "own": ["down", "town", "brown", "crown", "frown", "drown", "clown", "gown"],
  "art": ["heart", "part", "start", "art", "smart", "dart", "chart", "cart", "depart", "impart"],
  "ell": ["tell", "well", "fell", "sell", "bell", "shell", "cell", "smell", "spell", "hell", "dwell", "swell", "yell", "compel", "excel", "expel", "rebel"],
  "end": ["end", "friend", "send", "spend", "bend", "blend", "lend", "mend", "trend", "amend", "defend", "depend", "extend", "pretend", "transcend"],
  "ent": ["went", "sent", "spent", "tent", "rent", "bent", "cent", "dent", "lent", "vent", "event", "invent", "prevent", "consent"],
  "est": ["best", "rest", "test", "west", "guest", "chest", "nest", "pest", "vest", "zest", "quest", "crest", "arrest", "invest", "suggest"],
  "et": ["get", "let", "met", "set", "yet", "bet", "net", "pet", "wet", "fret", "sweat", "threat", "forget", "regret", "upset"],
  "ice": ["ice", "nice", "price", "rice", "slice", "spice", "twice", "mice", "dice", "vice", "advice", "device"],
  "ife": ["life", "wife", "knife", "strife"],
  "ill": ["will", "still", "kill", "fill", "bill", "hill", "mill", "pill", "till", "chill", "drill", "grill", "skill", "spill", "thrill", "fulfill", "instill"],
  "ink": ["think", "drink", "pink", "sink", "blink", "link", "shrink", "stink", "wink"],
  "iss": ["miss", "kiss", "this", "bliss", "hiss", "swiss", "dismiss", "abyss"],
  "ive": ["live", "give", "drive", "five", "dive", "hive", "jive", "strive", "thrive", "arrive", "deprive", "derive", "revive", "survive"],
  "ock": ["rock", "block", "clock", "lock", "mock", "sock", "shock", "stock", "flock", "knock"],
  "oke": ["broke", "spoke", "woke", "smoke", "joke", "choke", "poke", "stroke", "provoke", "revoke", "invoke"],
  "one": ["one", "done", "none", "son", "sun", "ton", "won", "spun", "stun", "begun", "undone"], // this one is 'un' sound, let's rename key or keep
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
  "unt": ["front", "hunt", "grunt", "stunt", "blunt", "brunt"],
  "up": ["up", "cup", "pup", "sup"],
  "urn": ["burn", "turn", "learn", "earn", "return", "fern", "yearn"],
  "ut": ["but", "cut", "hut", "nut", "shut", "gut", "rut", "strut"],
  "ash": ["ash", "cash", "dash", "flash", "smash", "crash", "hash", "mash", "rash", "slash", "trash", "splash"],
  "eep": ["deep", "keep", "sleep", "sweep", "weep", "creep", "peep", "sheep", "steep"]
};

const SCHEME_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-rose-500", 
  "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-cyan-500"
];

function analyzeRhymeScheme(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const endings = lines.map(l => {
    const words = l.split(/\s+/);
    return words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  });

  const scheme: string[] = [];
  const families: Record<string, string> = {};
  let nextChar = 65; // 'A'

  endings.forEach(word => {
    if (!word) {
      scheme.push('');
      return;
    }

    let found = false;
    for (const [fam, words] of Object.entries(RHYME_FAMILIES)) {
      if (words.includes(word) || word.endsWith(fam)) {
        if (!families[fam]) {
          families[fam] = String.fromCharCode(nextChar++);
        }
        scheme.push(families[fam]);
        found = true;
        break;
      }
    }

    if (!found) {
      // Very basic fallback: just group identical words
      if (!families[word]) {
        families[word] = String.fromCharCode(nextChar++);
      }
      scheme.push(families[word]);
    }
  });

  return { lines, scheme };
}

export default function Lyrics() {
  const [lyrics, setLyrics] = useLocalStorage("song-architect-lyrics", "");
  const [searchWord, setSearchWord] = useState("");

  const { lines, scheme } = useMemo(() => analyzeRhymeScheme(lyrics), [lyrics]);

  const searchResults = useMemo(() => {
    if (!searchWord) return null;
    const term = searchWord.toLowerCase().trim();
    
    for (const [, words] of Object.entries(RHYME_FAMILIES)) {
      if (words.includes(term)) {
        return words.filter(w => w !== term);
      }
    }
    
    // Find endings that match
    for (const [fam, words] of Object.entries(RHYME_FAMILIES)) {
      if (term.endsWith(fam)) {
        return words;
      }
    }
    return [];
  }, [searchWord]);

  return (
    <PageTransition className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lyric Workshop</h1>
        <p className="text-muted-foreground mt-1">Write, analyze, and find the perfect rhyme.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Editor Pane */}
        <div className="flex flex-col glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/20">
            <h3 className="font-medium text-sm text-muted-foreground">Editor</h3>
          </div>
          <Textarea 
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-6 text-lg leading-relaxed font-serif"
            placeholder="Start writing lyrics here..."
            data-testid="textarea-lyrics"
          />
        </div>

        {/* Analysis Pane */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <Card className="glass-card flex-1 flex flex-col min-h-0">
            <CardHeader className="py-4 px-6 border-b border-white/5 bg-black/20">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rhyme Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <ScrollArea className="h-full p-6">
                {lines.length === 0 ? (
                  <p className="text-muted-foreground text-center italic mt-10">Write something to see the rhyme scheme.</p>
                ) : (
                  <div className="space-y-2">
                    {lines.map((line, i) => {
                      const letter = scheme[i];
                      const colorIdx = letter ? (letter.charCodeAt(0) - 65) % SCHEME_COLORS.length : 0;
                      return (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-8 pt-1 flex-shrink-0">
                            {letter && (
                              <Badge className={cn("w-full justify-center text-white", SCHEME_COLORS[colorIdx])}>
                                {letter}
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg font-serif">{line}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="py-4 px-6 border-b border-white/5 bg-black/20">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rhyme Finder</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Type a word..."
                  className="pl-9 bg-black/20 border-white/10"
                  data-testid="input-rhyme-search"
                />
              </div>
              
              {searchResults !== null && (
                <div>
                  {searchResults.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map(word => (
                        <Badge key={word} variant="secondary" className="bg-white/5 hover:bg-white/10 text-sm py-1 px-3">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No common rhymes found in dictionary.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
