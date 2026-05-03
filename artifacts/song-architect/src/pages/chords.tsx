import { useState, useMemo } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { playChord, NOTES } from "@/lib/audio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, GripVertical, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = ["Major", "Minor", "Harmonic Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian"];

// Simplified scale intervals (semitones from root)
const SCALE_INTERVALS: Record<string, number[]> = {
  "Major": [0, 2, 4, 5, 7, 9, 11],
  "Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10]
};

// Map scale degree to chord quality (simplification for Major/Minor)
const MAJOR_CHORDS = ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"];
const MINOR_CHORDS = ["Minor", "Diminished", "Major", "Minor", "Minor", "Major", "Major"];
const ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const ROMAN_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

const PRESETS = [
  { name: "Pop (Major)", key: "C", scale: "Major", progression: [0, 4, 5, 3] }, // I-V-vi-IV
  { name: "Jazz (Major)", key: "C", scale: "Major", progression: [1, 4, 0, 5] }, // ii-V-I-vi
  { name: "EDM (Minor)", key: "A", scale: "Minor", progression: [0, 5, 2, 6] }, // i-VI-III-VII
  { name: "Sad (Minor)", key: "A", scale: "Minor", progression: [0, 6, 5, 6] }, // i-VII-VI-VII
  { name: "Epic (Minor)", key: "A", scale: "Minor", progression: [0, 5, 2, 4, 5, 0, 3, 4] },
  { name: "Andalusian (Minor)", key: "A", scale: "Minor", progression: [0, 6, 5, 4] } // i-VII-VI-V
];

function getChordNotes(rootNote: string, quality: string): string[] {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootIdx = allNotes.indexOf(rootNote);
  
  let intervals = [0, 4, 7]; // Major
  if (quality === "Minor") intervals = [0, 3, 7];
  if (quality === "Diminished") intervals = [0, 3, 6];
  if (quality === "Augmented") intervals = [0, 4, 8];

  return intervals.map(interval => allNotes[(rootIdx + interval) % 12]);
}

function getNoteFrequency(noteName: string, octave: number): number {
  const key = `${noteName}${octave}`;
  if (NOTES[key]) return NOTES[key];
  // Fallback if octave exceeds map
  if (octave > 4) return getNoteFrequency(noteName, octave - 1) * 2;
  if (octave < 3) return getNoteFrequency(noteName, octave + 1) / 2;
  return 440;
}

function playChordFromNotes(notes: string[], baseOctave = 3) {
  const frequencies = notes.map((note, i) => {
    // Simple logic to avoid crossing C boundaries weirdly
    let oct = baseOctave;
    if (i > 0 && ["C", "C#", "D"].includes(note) && !["C", "C#", "D"].includes(notes[0])) {
      oct++;
    }
    return getNoteFrequency(note, oct);
  });
  playChord(frequencies, 1.5);
}

export default function Chords() {
  const [selectedKey, setSelectedKey] = useLocalStorage("song-architect-key", "C");
  const [selectedScale, setSelectedScale] = useLocalStorage("song-architect-scale", "Major");
  const [progression, setProgression] = useLocalStorage<number[]>("song-architect-progression", [0, 4, 5, 3]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIdx, setActiveChordIdx] = useState<number | null>(null);

  // Generate diatonic chords for current key/scale
  const diatonicChords = useMemo(() => {
    const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIdx = allNotes.indexOf(selectedKey);
    const intervals = SCALE_INTERVALS[selectedScale] || SCALE_INTERVALS["Major"];
    
    const qualities = selectedScale.includes("Minor") ? MINOR_CHORDS : MAJOR_CHORDS;
    const numerals = selectedScale.includes("Minor") ? ROMAN_MINOR : ROMAN_MAJOR;

    return intervals.map((interval, idx) => {
      const rootNote = allNotes[(rootIdx + interval) % 12];
      const quality = qualities[idx];
      const numeral = numerals[idx];
      const notes = getChordNotes(rootNote, quality);
      
      let name = rootNote;
      if (quality === "Minor") name += "m";
      if (quality === "Diminished") name += "dim";

      return { rootNote, quality, name, numeral, notes };
    });
  }, [selectedKey, selectedScale]);

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setSelectedKey(preset.key);
    setSelectedScale(preset.scale);
    setProgression(preset.progression);
  };

  const playSequence = async () => {
    if (isPlaying || progression.length === 0) return;
    setIsPlaying(true);
    
    for (let i = 0; i < progression.length; i++) {
      setActiveChordIdx(i);
      const degree = progression[i];
      const chord = diatonicChords[degree];
      if (chord) {
        playChordFromNotes(chord.notes);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setActiveChordIdx(null);
    setIsPlaying(false);
  };

  // Build piano keys
  const pianoKeys = useMemo(() => {
    const keys = [];
    const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (let oct = 3; oct <= 4; oct++) {
      for (let i = 0; i < 12; i++) {
        keys.push({ note: allNotes[i], octave: oct, isBlack: allNotes[i].includes("#") });
      }
    }
    return keys;
  }, []);

  // Determine active notes to highlight on piano
  const activeNotes = useMemo(() => {
    if (activeChordIdx !== null && progression[activeChordIdx] !== undefined) {
      return diatonicChords[progression[activeChordIdx]]?.notes || [];
    }
    return [];
  }, [activeChordIdx, progression, diatonicChords]);

  const addToProgression = (degree: number) => {
    setProgression([...progression, degree]);
    playChordFromNotes(diatonicChords[degree].notes);
  };

  const removeFromProgression = (idx: number) => {
    setProgression(progression.filter((_, i) => i !== idx));
  };

  return (
    <PageTransition className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chord Progression Builder</h1>
        <p className="text-muted-foreground mt-1">Discover, hear, and build harmonic foundations.</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Key</label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-[100px] bg-black/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Scale</label>
          <Select value={selectedScale} onValueChange={setSelectedScale}>
            <SelectTrigger className="w-[160px] bg-black/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => loadPreset(p)} className="text-xs">
              {p.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Diatonic Chords in {selectedKey} {selectedScale}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {diatonicChords.map((chord, idx) => (
            <div 
              key={idx} 
              className="glass-card p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => addToProgression(idx)}
            >
              <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{chord.name}</span>
              <span className="text-sm font-serif text-muted-foreground mt-1">{chord.numeral}</span>
              <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); playChordFromNotes(chord.notes); }}>
                  <Play className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Progression</h3>
          <Button onClick={playSequence} disabled={isPlaying || progression.length === 0} className="gap-2" data-testid="btn-play-progression">
            <Play className="w-4 h-4" /> {isPlaying ? "Playing..." : "Play Sequence"}
          </Button>
        </div>

        <div className="min-h-[120px] p-6 glass-card rounded-xl flex flex-wrap gap-4 items-center bg-black/20">
          {progression.length === 0 ? (
            <p className="text-muted-foreground text-sm mx-auto">Click chords above to build a progression.</p>
          ) : (
            progression.map((degree, idx) => {
              const chord = diatonicChords[degree];
              if (!chord) return null;
              const isActive = activeChordIdx === idx;
              
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "relative px-6 py-4 rounded-xl border transition-all duration-300 flex flex-col items-center min-w-[100px]",
                    isActive 
                      ? "bg-primary/20 border-primary/50 scale-110 shadow-[0_0_20px_rgba(124,58,237,0.3)] z-10" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="font-bold text-xl">{chord.name}</span>
                  <span className="text-xs text-muted-foreground">{chord.numeral}</span>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => removeFromProgression(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Visual Piano Keyboard */}
      <div className="pt-8 flex justify-center overflow-x-auto pb-8">
        <div className="relative flex bg-[#111] p-2 rounded-lg border border-white/10">
          {pianoKeys.filter(k => !k.isBlack).map((k, i) => {
            const isActive = activeNotes.includes(k.note);
            return (
              <div 
                key={`${k.note}${k.octave}`}
                className={cn(
                  "w-10 h-32 border border-black/20 rounded-b-sm relative z-0 transition-colors duration-200",
                  isActive ? "bg-primary/80" : "bg-white"
                )}
              >
                <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-black/40 font-semibold">{k.note}</span>
              </div>
            );
          })}
          
          <div className="absolute top-2 left-2 right-2 flex pointer-events-none z-10">
            {pianoKeys.map((k, i) => {
              if (!k.isBlack) {
                // If the next key is white (E->F, B->C), we need a spacer block instead of a black key
                const nextIsWhite = i < pianoKeys.length - 1 && !pianoKeys[i+1].isBlack;
                if (nextIsWhite) return <div key={`spacer-${i}`} className="w-10 h-20" />;
                return null;
              }
              
              const isActive = activeNotes.includes(k.note.replace("#", "")); // simplification, activeNotes are naturals currently due to chord notes generator
              // wait, getChordNotes returns sharps if root has sharp. But we need exact matching.
              const isActiveExact = activeNotes.includes(k.note);
              
              return (
                <div 
                  key={`${k.note}${k.octave}`}
                  className={cn(
                    "w-6 h-20 -ml-3 -mr-3 z-10 rounded-b-sm border border-black transition-colors duration-200 shadow-md",
                    isActiveExact ? "bg-primary" : "bg-[#222]"
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

    </PageTransition>
  );
}
