import { useState, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GENRES = ["Pop", "Hip-Hop", "R&B", "EDM", "Rock", "Metal", "Jazz", "Blues", "Country", "Folk", "Classical", "Reggae", "Latin", "K-Pop", "Indie", "Alternative", "Soul", "Gospel", "Trap", "Drill", "Afrobeats", "Phonk"];
const MOODS = ["Happy", "Sad", "Angry", "Melancholic", "Euphoric", "Nostalgic", "Anxious", "Hopeful", "Defiant", "Romantic", "Dark", "Mysterious", "Peaceful", "Energetic"];
const INSTRUMENTS = ["Guitar", "Piano", "Strings", "Brass", "808s", "Synths", "Drums", "Bass", "Vocals", "Choir", "Flute", "Violin", "Cello", "Trumpet", "Sax", "Harp", "Organ", "Pad", "Lead", "Arp"];

type GeneratedConcept = {
  id: string;
  date: string;
  genre: string;
  mood: string;
  theme: string;
  bpmRange: string;
  titles: string[];
  hookIdea: string;
  verseThemes: string[];
  bridgeConcept: string;
  productionNotes: string;
  referenceArtists: string[];
};

export default function Inspiration() {
  const [savedConcepts, setSavedConcepts] = useLocalStorage<GeneratedConcept[]>("song-architect-concepts", []);
  
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [bpmMin, setBpmMin] = useState("90");
  const [bpmMax, setBpmMax] = useState("110");
  const [theme, setTheme] = useState("");
  const [selectedInsts, setSelectedInsts] = useState<string[]>(["Piano", "Synths"]);
  
  const [currentConcept, setCurrentConcept] = useState<GeneratedConcept | null>(null);

  useEffect(() => {
    if (savedConcepts.length === 0) {
      setSavedConcepts([
        { id: crypto.randomUUID(), date: "2026-04-01T09:00:00.000Z", genre: "R&B", mood: "Melancholic", theme: "letting go", bpmRange: "84-96", titles: ["Ghost In The Mix", "Soft Exit", "Afterimage"], hookIdea: "A half-whispered chorus about releasing what still haunts you, built over a sparse piano loop and swollen harmonies.", verseThemes: ["The last text that never came back", "Learning the shape of absence", "Choosing peace over replaying the pain"], bridgeConcept: "Drop to a single vocal and piano motif before the final chorus blooms into layered harmonies.", productionNotes: "Use intimate close-miked vocals, filtered Rhodes, distant sub-bass, and a brushed-snare pocket.", referenceArtists: ["Frank Ocean", "James Blake", "SZA"] },
        { id: crypto.randomUUID(), date: "2026-04-02T09:00:00.000Z", genre: "Pop", mood: "Hopeful", theme: "starting over", bpmRange: "118-124", titles: ["First Light Drive", "Open Windows", "Reset the Sky"], hookIdea: "A bright, chantable hook that turns recovery into a road trip anthem with sunlit synths and stacked claps.", verseThemes: ["Leaving the old neighborhood behind", "Rediscovering motion", "Turning mistakes into momentum"], bridgeConcept: "A half-time bridge with filtered drums that lifts into a key-change feeling without changing the key.", productionNotes: "Big drums, glossy synth plucks, wide chorus doubles, and a lift in the final 8 bars.", referenceArtists: ["Dua Lipa", "The Weeknd", "MUNA"] },
        { id: crypto.randomUUID(), date: "2026-04-03T09:00:00.000Z", genre: "Hip-Hop", mood: "Defiant", theme: "survival", bpmRange: "140-152", titles: ["No Luck Left", "Street Halo", "Still Standing"], hookIdea: "A punchy mantra chorus with chopped vocal samples and a bassline that feels like it won't back down.", verseThemes: ["Pressure from every side", "Learning the rules too late", "Winning by refusing to quit"], bridgeConcept: "Strip the beat to percussion and spoken cadence, then slam back in with doubled 808s.", productionNotes: "Dark keys, aggressive drum programming, tight snare snap, and a triumphant brass stab motif.", referenceArtists: ["Kendrick Lamar", "J. Cole", "Freddie Gibbs"] },
        { id: crypto.randomUUID(), date: "2026-04-04T09:00:00.000Z", genre: "Indie", mood: "Nostalgic", theme: "small town summers", bpmRange: "92-104", titles: ["Back Porch Satellites", "Summer Static", "The Long Way Home"], hookIdea: "A warm, wistful chorus that feels like porch light fading into dusk, carried by jangly guitars and soft gang vocals.", verseThemes: ["Memory stitched to place", "Friends drifting apart", "The last night before everything changed"], bridgeConcept: "A wide ambient break with field recordings and a single melody line on guitar harmonics.", productionNotes: "Tape warmth, roomy drums, chiming guitars, and a subtle pedal steel shimmer.", referenceArtists: ["Bon Iver", "Vampire Weekend", "Phoebe Bridgers"] },
        { id: crypto.randomUUID(), date: "2026-04-05T09:00:00.000Z", genre: "EDM", mood: "Euphoric", theme: "nightfall city escape", bpmRange: "126-132", titles: ["Electric Overpass", "Neon Run", "Midnight Lift"], hookIdea: "A festival-ready topline that explodes into a drop with vocal chops and rising synth arps.", verseThemes: ["Chasing the skyline", "Breaking routine at 2AM", "Finding freedom in motion"], bridgeConcept: "A breakdown with filtered pads and a suspenseful riser that detonates into the final drop.", productionNotes: "Punchy sidechained kick, shimmering supersaws, impact hits, and a huge stereo spread.", referenceArtists: ["Disclosure", "RÜFÜS DU SOL", "Madeon"] }
      ]);
    }
  }, [savedConcepts.length, setSavedConcepts]);

  const toggleInst = (inst: string) => {
    if (selectedInsts.includes(inst)) {
      setSelectedInsts(selectedInsts.filter(i => i !== inst));
    } else {
      setSelectedInsts([...selectedInsts, inst]);
    }
  };

  const generateConcept = () => {
    // Deterministic-ish generation based on inputs
    const baseTheme = theme || "the human condition";
    const instStr = selectedInsts.length > 0 ? selectedInsts.join(" and ") : "minimal instrumentation";
    
    // Arrays of creative snippets
    const titles = [
      `${mood} ${baseTheme}`,
      `Beyond the ${baseTheme}`,
      `Echoes of ${genre}`,
      `Midnight ${instStr.split(' ')[0]}`,
      `${baseTheme} in ${bpmMin} BPM`
    ].sort(() => 0.5 - Math.random()).slice(0, 3);

    const hooks = [
      `A soaring melody over heavy ${selectedInsts[0] || 'drums'} that resolves the tension of the verse, chanting about ${baseTheme}.`,
      `A rhythmic, driving vocal chop pattern that abruptly cuts to silence before dropping into a massive ${mood.toLowerCase()} chorus about ${baseTheme}.`,
      `An intimate, almost whispered confession about ${baseTheme}, surrounded by swirling ${selectedInsts[1] || 'synths'}.`
    ];

    const verses = [
      `Setting the scene: the initial realization of ${baseTheme}.`,
      `The complication: how ${mood.toLowerCase()} emotions twist the perspective.`,
      `The aftermath: looking back at the wreckage.`,
      `Sensory details of the environment.`,
      `A direct address to the antagonist of the story.`
    ];

    const bridges = [
      `A sudden half-time switch up, dropping all instruments except ${selectedInsts[0] || 'piano'}.`,
      `Building a chaotic wall of sound with ${instStr} that abruptly stops.`,
      `A completely different chord progression introducing a new, conflicting perspective on ${baseTheme}.`
    ];

    const production = [
      `Keep the low-end muddy but precise. Use heavy saturation on the ${selectedInsts[0] || 'lead'} to convey the ${mood.toLowerCase()} vibe.`,
      `Aim for a wide stereo image in the chorus. The tempo should feel pushing at ${bpmMax} BPM but dragging at ${bpmMin} BPM.`,
      `Very dry, upfront vocals. Let the ${instStr} sit wide and drowned in lush reverb to create contrast.`
    ];

    const artists = ["Frank Ocean", "The Weeknd", "Billie Eilish", "Tame Impala", "Rosalía", "Kendrick Lamar", "James Blake", "FKA twigs", "Bon Iver", "Flume"];

    const concept: GeneratedConcept = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      genre,
      mood,
      theme: baseTheme,
      bpmRange: `${bpmMin}-${bpmMax}`,
      titles,
      hookIdea: hooks[Math.floor(Math.random() * hooks.length)],
      verseThemes: verses.sort(() => 0.5 - Math.random()).slice(0, 3),
      bridgeConcept: bridges[Math.floor(Math.random() * bridges.length)],
      productionNotes: production[Math.floor(Math.random() * production.length)],
      referenceArtists: artists.sort(() => 0.5 - Math.random()).slice(0, 3)
    };

    setCurrentConcept(concept);
  };

  const saveConcept = () => {
    if (currentConcept && !savedConcepts.find(c => c.id === currentConcept.id)) {
      setSavedConcepts([currentConcept, ...savedConcepts]);
    }
  };

  const deleteConcept = (id: string) => {
    setSavedConcepts(savedConcepts.filter(c => c.id !== id));
    if (currentConcept?.id === id) {
      setCurrentConcept(null);
    }
  };

  return (
    <PageTransition className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inspiration Generator</h1>
        <p className="text-muted-foreground mt-1">Break writer's block with detailed, algorithmically crafted song concepts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-6 border-primary/20">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Parameters
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Mood</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent>{MOODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">BPM Range</label>
              <div className="flex items-center gap-2">
                <Input type="number" value={bpmMin} onChange={e => setBpmMin(e.target.value)} className="bg-black/20" />
                <span className="text-muted-foreground">to</span>
                <Input type="number" value={bpmMax} onChange={e => setBpmMax(e.target.value)} className="bg-black/20" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Theme / Keyword (Optional)</label>
              <Input 
                value={theme} 
                onChange={e => setTheme(e.target.value)} 
                placeholder="e.g. losing a friend, summer nights..."
                className="bg-black/20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Key Instruments</label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map(inst => (
                  <Badge 
                    key={inst} 
                    variant={selectedInsts.includes(inst) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleInst(inst)}
                  >
                    {inst}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={generateConcept} className="w-full py-6 text-lg font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow">
              Generate Concept
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {currentConcept ? (
            <div className="glass-card p-8 rounded-xl border-secondary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="secondary" size="sm" onClick={saveConcept} className="gap-2">
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/30">{currentConcept.genre}</Badge>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">{currentConcept.mood}</Badge>
                <Badge variant="outline">{currentConcept.bpmRange} BPM</Badge>
              </div>

              <div className="space-y-8">
                <section>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Suggested Titles</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-xl font-serif">
                    {currentConcept.titles.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">The Hook</h4>
                  <p className="text-lg leading-relaxed">{currentConcept.hookIdea}</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Verse Themes</h4>
                    <ul className="space-y-2">
                      {currentConcept.verseThemes.map((v, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-bold">{i+1}.</span> {v}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Bridge Concept</h4>
                    <p className="text-sm">{currentConcept.bridgeConcept}</p>
                  </section>
                </div>

                <section className="bg-black/30 p-4 rounded-lg border border-white/5">
                  <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Production Notes</h4>
                  <p className="font-mono text-sm text-muted-foreground">{currentConcept.productionNotes}</p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Sonic References</h4>
                  <p className="text-sm text-white/70">{currentConcept.referenceArtists.join(" • ")}</p>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5 p-12 text-center">
              <div>
                <Sparkles className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Waiting for spark</h3>
                <p className="text-muted-foreground">Adjust parameters and click Generate to create a new song concept.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {savedConcepts.length > 0 && (
        <div className="pt-12">
          <h2 className="text-2xl font-bold mb-6">Saved Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedConcepts.map(concept => (
              <div key={concept.id} className="glass-card p-5 rounded-xl flex flex-col cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentConcept(concept)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg truncate pr-4">{concept.titles[0]}</h4>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteConcept(concept.id); }} className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{concept.hookIdea}</p>
                <div className="flex gap-2 text-xs font-mono text-white/50">
                  <span>{concept.genre}</span>
                  <span>•</span>
                  <span>{concept.mood}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
