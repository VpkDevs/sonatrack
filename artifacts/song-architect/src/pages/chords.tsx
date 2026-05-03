import { useState, useMemo, useCallback } from "react";
import { PageTransition } from "@/components/page-transition";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { playChord, NOTES } from "@/lib/audio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = ["Major", "Minor", "Harmonic Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian"];

const SCALE_INTERVALS: Record<string, number[]> = {
  "Major": [0, 2, 4, 5, 7, 9, 11],
  "Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10]
};

const MAJOR_CHORDS = ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"];
const MINOR_CHORDS = ["Minor", "Diminished", "Major", "Minor", "Minor", "Major", "Major"];
const ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const ROMAN_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

const PRESETS = [
  { name: "Pop I–V–vi–IV", key: "C", scale: "Major", progression: [0, 4, 5, 3] },
  { name: "Jazz ii–V–I", key: "C", scale: "Major", progression: [1, 4, 0] },
  { name: "EDM Minor", key: "A", scale: "Minor", progression: [0, 5, 2, 6] },
  { name: "Sad Ballad", key: "A", scale: "Minor", progression: [0, 6, 5, 6] },
  { name: "Epic Minor", key: "A", scale: "Minor", progression: [0, 5, 2, 4, 5, 0, 3, 4] },
  { name: "Andalusian", key: "A", scale: "Minor", progression: [0, 6, 5, 4] },
];

function getChordNotes(rootNote: string, quality: string): string[] {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootIdx = allNotes.indexOf(rootNote);
  let intervals = [0, 4, 7];
  if (quality === "Minor") intervals = [0, 3, 7];
  if (quality === "Diminished") intervals = [0, 3, 6];
  if (quality === "Augmented") intervals = [0, 4, 8];
  return intervals.map(interval => allNotes[(rootIdx + interval) % 12]);
}

function getNoteFrequency(noteName: string, octave: number): number {
  const key = `${noteName}${octave}`;
  if (NOTES[key]) return NOTES[key];
  if (octave > 5) return getNoteFrequency(noteName, octave - 1) * 2;
  if (octave < 3) return getNoteFrequency(noteName, octave + 1) / 2;
  return 440;
}

function playChordFromNotes(notes: string[], baseOctave = 3) {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const frequencies = notes.map((note, i) => {
    let oct = baseOctave;
    if (i > 0) {
      const rootIdx = allNotes.indexOf(notes[0]);
      const noteIdx = allNotes.indexOf(note);
      if (noteIdx < rootIdx) oct++;
    }
    return getNoteFrequency(note, oct);
  });
  playChord(frequencies, 1.8);
}

function playSingleNote(noteName: string, octave: number) {
  const freq = getNoteFrequency(noteName, octave);
  playChord([freq, freq * 2], 0.6);
}

export default function Chords() {
  const [selectedKey, setSelectedKey] = useLocalStorage("song-architect-key", "C");
  const [selectedScale, setSelectedScale] = useLocalStorage("song-architect-scale", "Major");
  const [progression, setProgression] = useLocalStorage<number[]>("song-architect-progression", [0, 4, 5, 3]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIdx, setActiveChordIdx] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const diatonicChords = useMemo(() => {
    const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIdx = allNotes.indexOf(selectedKey);
    const intervals = SCALE_INTERVALS[selectedScale] || SCALE_INTERVALS["Major"];
    const qualities = selectedScale.includes("Minor") ? MINOR_CHORDS : MAJOR_CHORDS;
    const numerals = selectedScale.includes("Minor") ? ROMAN_MINOR : ROMAN_MAJOR;

    return intervals.map((semitones, i) => {
      const noteIdx = (rootIdx + semitones) % 12;
      const noteRoot = allNotes[noteIdx];
      const quality = qualities[i];
      const notes = getChordNotes(noteRoot, quality);
      return {
        name: `${noteRoot}${quality === "Major" ? "" : quality === "Minor" ? "m" : quality === "Diminished" ? "°" : "+"}`,
        numeral: numerals[i],
        notes,
        quality,
      };
    });
  }, [selectedKey, selectedScale]);

  const pianoKeys = useMemo(() => {
    const keys = [];
    const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (let oct = 3; oct <= 5; oct++) {
      for (let i = 0; i < 12; i++) {
        keys.push({ note: allNotes[i], octave: oct, isBlack: allNotes[i].includes("#") });
      }
    }
    return keys;
  }, []);

  const activeNotes = useMemo(() => {
    if (activeChordIdx !== null && progression[activeChordIdx] !== undefined) {
      return diatonicChords[progression[activeChordIdx]]?.notes || [];
    }
    return [];
  }, [activeChordIdx, progression, diatonicChords]);

  const loadPreset = useCallback((p: typeof PRESETS[0]) => {
    setSelectedKey(p.key);
    setSelectedScale(p.scale);
    setProgression(p.progression);
  }, [setSelectedKey, setSelectedScale, setProgression]);

  const addToProgression = (degree: number) => {
    setProgression([...progression, degree]);
    playChordFromNotes(diatonicChords[degree].notes);
  };

  const removeFromProgression = (idx: number) => {
    setProgression(progression.filter((_, i) => i !== idx));
  };

  const playSequence = async () => {
    if (isPlaying || progression.length === 0) return;
    setIsPlaying(true);
    for (let i = 0; i < progression.length; i++) {
      setActiveChordIdx(i);
      const degree = progression[i];
      if (diatonicChords[degree]) {
        playChordFromNotes(diatonicChords[degree].notes);
      }
      await new Promise(r => setTimeout(r, 1600));
    }
    setIsPlaying(false);
    setActiveChordIdx(null);
  };

  const handlePianoKeyClick = (note: string, octave: number) => {
    const keyId = `${note}${octave}`;
    setPressedKey(keyId);
    playSingleNote(note, octave);
    setTimeout(() => setPressedKey(null), 180);
  };

  // Build white key + black key layout for rendering
  const whiteKeys = pianoKeys.filter(k => !k.isBlack);

  return (
    <PageTransition className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chord Progression Builder</h1>
        <p className="text-muted-foreground mt-1">Click diatonic chords to add to your progression. Click piano keys to hear individual notes.</p>
      </div>

      {/* Key + Scale + Presets */}
      <div className="flex flex-wrap gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-[100px] bg-black/40 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scale</label>
          <Select value={selectedScale} onValueChange={setSelectedScale}>
            <SelectTrigger className="w-[165px] bg-black/40 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => loadPreset(p)}
              className="text-xs border-white/10 hover:border-secondary/50 hover:text-secondary"
            >
              {p.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Diatonic Chord Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Diatonic chords in {selectedKey} {selectedScale}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {diatonicChords.map((chord, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 py-5 group select-none"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.55)";
                (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              onClick={() => addToProgression(idx)}
              data-testid={`chord-${idx}`}
            >
              <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{chord.name}</span>
              <span className="text-xs font-mono text-muted-foreground mt-1 tracking-widest">{chord.numeral}</span>
              <span className="text-[10px] text-muted-foreground/50 mt-1">{chord.quality}</span>
              <button
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); playChordFromNotes(chord.notes); }}
                title="Play chord"
              >
                <Play className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Your Progression</h3>
          <div className="flex gap-2">
            {progression.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProgression([])}
                className="text-xs text-muted-foreground hover:text-red-400"
              >
                Clear
              </Button>
            )}
            <Button
              onClick={playSequence}
              disabled={isPlaying || progression.length === 0}
              className="gap-2"
              data-testid="btn-play-progression"
            >
              <Play className="w-4 h-4" />
              {isPlaying ? "Playing…" : "Play Sequence"}
            </Button>
          </div>
        </div>

        <div className="min-h-[100px] p-5 rounded-xl flex flex-wrap gap-3 items-center border border-white/8 bg-black/20">
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
                    "relative px-5 py-3.5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center min-w-[90px] cursor-pointer select-none group",
                    isActive
                      ? "scale-110 z-10"
                      : "hover:border-white/25"
                  )}
                  style={isActive ? {
                    background: "rgba(124,58,237,0.22)",
                    borderColor: "rgba(124,58,237,0.6)",
                    boxShadow: "0 0 28px rgba(124,58,237,0.35)"
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.12)"
                  }}
                  onClick={() => { setActiveChordIdx(idx); playChordFromNotes(chord.notes); }}
                >
                  <span className={cn("font-bold text-xl transition-colors", isActive ? "text-primary" : "text-white")}>
                    {chord.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{chord.numeral}</span>
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(239,68,68,0.85)" }}
                    onClick={(e) => { e.stopPropagation(); removeFromProgression(idx); }}
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Piano — click to play</h3>
        <div className="overflow-x-auto pb-4">
          <div className="relative inline-flex" style={{ background: "#0d0d0d", padding: "10px 10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", minWidth: "max-content" }}>
            {/* Render white keys */}
            <div className="relative flex">
              {pianoKeys.map((k, pianoIdx) => {
                if (k.isBlack) return null;
                const keyId = `${k.note}${k.octave}`;
                const isActive = activeNotes.includes(k.note);
                const isPressed = pressedKey === keyId;
                return (
                  <div
                    key={keyId}
                    onClick={() => handlePianoKeyClick(k.note, k.octave)}
                    className="relative cursor-pointer select-none"
                    style={{
                      width: "38px",
                      height: "130px",
                      background: isActive
                        ? "linear-gradient(180deg, hsl(262,83%,68%) 0%, hsl(262,83%,55%) 100%)"
                        : isPressed
                          ? "linear-gradient(180deg, #d8d0ff 0%, #b8b0f0 100%)"
                          : "linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)",
                      border: "1px solid rgba(0,0,0,0.3)",
                      borderRadius: "0 0 5px 5px",
                      marginRight: "1px",
                      boxShadow: isActive
                        ? "0 4px 16px rgba(124,58,237,0.5), inset 0 -2px 4px rgba(0,0,0,0.2)"
                        : "inset 0 -3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                      transform: isPressed ? "scaleY(0.97)" : "scaleY(1)",
                      transformOrigin: "top center",
                      transition: "background 80ms, box-shadow 80ms, transform 80ms",
                      zIndex: 1,
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      bottom: "6px",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: isActive ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.3)",
                      fontFamily: "monospace",
                      letterSpacing: "0.05em"
                    }}>
                      {k.note}{k.octave}
                    </span>
                  </div>
                );
              })}

              {/* Overlay black keys */}
              <div className="absolute top-0 left-0 flex pointer-events-none" style={{ zIndex: 2 }}>
                {(() => {
                  const blackKeyPositions: JSX.Element[] = [];
                  let whiteOffset = 0;
                  pianoKeys.forEach((k, idx) => {
                    const keyId = `${k.note}${k.octave}`;
                    const isActive = activeNotes.includes(k.note);
                    const isPressed = pressedKey === keyId;
                    if (!k.isBlack) {
                      whiteOffset++;
                    } else {
                      const leftPx = (whiteOffset - 1) * 39 + 39 - 13;
                      blackKeyPositions.push(
                        <div
                          key={keyId}
                          onClick={(e) => { e.stopPropagation(); handlePianoKeyClick(k.note, k.octave); }}
                          className="absolute cursor-pointer pointer-events-auto select-none"
                          style={{
                            left: `${leftPx}px`,
                            width: "26px",
                            height: "82px",
                            background: isActive
                              ? "linear-gradient(180deg, hsl(262,83%,55%) 0%, hsl(262,83%,38%) 100%)"
                              : isPressed
                                ? "linear-gradient(180deg, #4a3880 0%, #2d1a5a 100%)"
                                : "linear-gradient(180deg, #2c2c2c 0%, #111 100%)",
                            borderRadius: "0 0 5px 5px",
                            border: "1px solid rgba(0,0,0,0.8)",
                            boxShadow: isActive
                              ? "0 4px 16px rgba(124,58,237,0.6)"
                              : "2px 4px 8px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)",
                            transform: isPressed ? "scaleY(0.97)" : "scaleY(1)",
                            transformOrigin: "top center",
                            transition: "background 80ms, box-shadow 80ms, transform 80ms",
                          }}
                        />
                      );
                    }
                  });
                  return blackKeyPositions;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
