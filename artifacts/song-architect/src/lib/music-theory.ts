import { NOTES } from "./audio";

export const KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type MusicalKey = (typeof KEYS)[number];

export const SCALES = [
  "Major",
  "Minor",
  "Harmonic Minor",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
] as const;

export type ScaleName = (typeof SCALES)[number];
export type ChordQuality = "Major" | "Minor" | "Diminished" | "Augmented";

export const SCALE_INTERVALS: Record<ScaleName, readonly number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const SCALE_QUALITIES: Record<ScaleName, readonly ChordQuality[]> = {
  Major: ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"],
  Minor: ["Minor", "Diminished", "Major", "Minor", "Minor", "Major", "Major"],
  "Harmonic Minor": [
    "Minor",
    "Diminished",
    "Augmented",
    "Minor",
    "Major",
    "Major",
    "Diminished",
  ],
  Dorian: ["Minor", "Minor", "Major", "Major", "Minor", "Diminished", "Major"],
  Phrygian: [
    "Minor",
    "Major",
    "Major",
    "Minor",
    "Diminished",
    "Major",
    "Minor",
  ],
  Lydian: ["Major", "Major", "Minor", "Diminished", "Major", "Minor", "Minor"],
  Mixolydian: [
    "Major",
    "Minor",
    "Diminished",
    "Major",
    "Minor",
    "Minor",
    "Major",
  ],
};

const SCALE_NUMERALS: Record<ScaleName, readonly string[]> = {
  Major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  Minor: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
  "Harmonic Minor": ["i", "ii°", "III+", "iv", "V", "VI", "vii°"],
  Dorian: ["i", "ii", "III", "IV", "v", "vi°", "VII"],
  Phrygian: ["i", "II", "III", "iv", "v°", "VI", "vii"],
  Lydian: ["I", "II", "iii", "iv°", "V", "vi", "vii"],
  Mixolydian: ["I", "ii", "iii°", "IV", "v", "vi", "VII"],
};

export interface ChordPreset {
  name: string;
  key: MusicalKey;
  scale: ScaleName;
  progression: number[];
}

export const PRESETS: ChordPreset[] = [
  { name: "Pop I–V–vi–IV", key: "C", scale: "Major", progression: [0, 4, 5, 3] },
  { name: "Jazz ii–V–I", key: "C", scale: "Major", progression: [1, 4, 0] },
  { name: "EDM Minor", key: "A", scale: "Minor", progression: [0, 5, 2, 6] },
  { name: "Sad Ballad", key: "A", scale: "Minor", progression: [0, 6, 5, 6] },
  {
    name: "Epic Minor",
    key: "A",
    scale: "Minor",
    progression: [0, 5, 2, 4, 5, 0, 3, 4],
  },
  { name: "Andalusian", key: "A", scale: "Minor", progression: [0, 6, 5, 4] },
];

export interface DiatonicChord {
  name: string;
  numeral: string;
  notes: string[];
  quality: ChordQuality;
}

export function getChordNotes(rootNote: string, quality: ChordQuality): string[] {
  const rootIdx = KEYS.indexOf(rootNote as MusicalKey);
  const safeRootIdx = rootIdx >= 0 ? rootIdx : 0;

  let intervals: [number, number, number] = [0, 4, 7];
  if (quality === "Minor") intervals = [0, 3, 7];
  if (quality === "Diminished") intervals = [0, 3, 6];
  if (quality === "Augmented") intervals = [0, 4, 8];

  return intervals.map((interval) => KEYS[(safeRootIdx + interval) % 12]);
}

export function getDiatonicChords(
  selectedKey: string,
  selectedScale: string,
): DiatonicChord[] {
  const rootIdx = KEYS.indexOf(selectedKey as MusicalKey);
  const safeRootIdx = rootIdx >= 0 ? rootIdx : 0;
  const scaleKey: ScaleName = (
    SCALES.includes(selectedScale as ScaleName) ? selectedScale : "Major"
  ) as ScaleName;

  const intervals = SCALE_INTERVALS[scaleKey];
  const qualities = SCALE_QUALITIES[scaleKey];
  const numerals = SCALE_NUMERALS[scaleKey];

  return intervals.map((semitones, i) => {
    const noteRoot = KEYS[(safeRootIdx + semitones) % 12];
    const quality = qualities[i];
    const suffix =
      quality === "Major"
        ? ""
        : quality === "Minor"
          ? "m"
          : quality === "Diminished"
            ? "°"
            : "+";

    return {
      name: `${noteRoot}${suffix}`,
      numeral: numerals[i],
      notes: getChordNotes(noteRoot, quality),
      quality,
    };
  });
}

export function getNoteFrequency(noteName: string, octave: number): number {
  const key = `${noteName}${octave}`;
  if (NOTES[key]) return NOTES[key];
  if (octave > 5) return getNoteFrequency(noteName, octave - 1) * 2;
  if (octave < 3) return getNoteFrequency(noteName, octave + 1) / 2;
  return 440;
}

export function buildChordFrequencies(
  notes: string[],
  baseOctave = 3,
): number[] {
  if (notes.length === 0) return [];
  const rootIdx = KEYS.indexOf(notes[0] as MusicalKey);

  return notes.map((note, i) => {
    let oct = baseOctave;
    if (i > 0) {
      const noteIdx = KEYS.indexOf(note as MusicalKey);
      if (noteIdx >= 0 && rootIdx >= 0 && noteIdx < rootIdx) {
        oct += 1;
      }
    }
    return getNoteFrequency(note, oct);
  });
}
