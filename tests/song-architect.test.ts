import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  KEYS,
  SCALES,
  PRESETS,
  getChordNotes,
  getDiatonicChords,
  getNoteFrequency,
  buildChordFrequencies,
} from "../artifacts/song-architect/src/lib/music-theory.ts";
import {
  analyzeRhymeScheme,
  findRhymes,
  rhymeLabelFromIndex,
  calculateTotalBars,
  formatStructureExport,
  reorderItems,
  sanitizeExternalUrl,
  generateSongConcept,
} from "../artifacts/song-architect/src/lib/song-utils.ts";

describe("music-theory", () => {
  it("computes C Major diatonic chords accurately", () => {
    const chords = getDiatonicChords("C", "Major");
    assert.equal(chords.length, 7);
    assert.deepEqual(
      chords.map((c) => c.name),
      ["C", "Dm", "Em", "F", "G", "Am", "B°"],
    );
    assert.deepEqual(
      chords.map((c) => c.numeral),
      ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    );
  });

  it("computes A Harmonic Minor with augmented III+ and major V chords", () => {
    const chords = getDiatonicChords("A", "Harmonic Minor");
    assert.deepEqual(
      chords.map((c) => c.name),
      ["Am", "B°", "C+", "Dm", "E", "F", "G#°"],
    );
    assert.equal(chords[2].quality, "Augmented");
    assert.deepEqual(chords[2].notes, ["C", "E", "G#"]);
    assert.equal(chords[4].quality, "Major");
    assert.deepEqual(chords[4].notes, ["E", "G#", "B"]);
  });

  it("supports every key and scale combination with valid triads", () => {
    for (const key of KEYS) {
      for (const scale of SCALES) {
        const chords = getDiatonicChords(key, scale);
        assert.equal(chords.length, 7);
        for (const chord of chords) {
          assert.equal(chord.notes.length, 3);
        }
      }
    }
  });

  it("validates preset indices are within diatonic bounds", () => {
    for (const preset of PRESETS) {
      const chords = getDiatonicChords(preset.key, preset.scale);
      for (const degree of preset.progression) {
        assert.ok(degree >= 0 && degree < chords.length);
      }
    }
  });

  it("computes chord notes and octave-wrapped frequencies monotonically", () => {
    assert.deepEqual(getChordNotes("G", "Major"), ["G", "B", "D"]);
    const freqs = buildChordFrequencies(["G", "B", "D"], 3);
    assert.equal(freqs.length, 3);
    assert.ok(freqs[0] < freqs[1] && freqs[1] < freqs[2]);
    assert.equal(getNoteFrequency("A", 4), 440);
    assert.equal(getNoteFrequency("A", 6), 1760);
    assert.equal(getNoteFrequency("A", 2), 110);
  });
});

describe("song-utils", () => {
  it("analyzes ABAB and AABB rhyme schemes while ignoring blank lines and punctuation", () => {
    const lyrics = `
      Running through the neon night,
      Calling out your secret name!
      Chasing shadows in the light,
      Nothing ever feels the same.
    `;
    const { lines, scheme } = analyzeRhymeScheme(lyrics);
    assert.equal(lines.length, 4);
    assert.deepEqual(scheme, ["A", "B", "A", "B"]);
  });

  it("wraps rhyme labels beyond 26 distinct rhyme groups without ASCII overflow", () => {
    assert.equal(rhymeLabelFromIndex(0), "A");
    assert.equal(rhymeLabelFromIndex(25), "Z");
    assert.equal(rhymeLabelFromIndex(26), "A2");
    assert.equal(rhymeLabelFromIndex(27), "B2");

    const uniqueWords = Array.from({ length: 30 }, (_, i) => `zzzzword${String.fromCharCode(97 + (i % 26))}${i}`).join("\n");
    const { scheme } = analyzeRhymeScheme(uniqueWords);
    assert.equal(scheme.length, 30);
    assert.ok(scheme.every((label) => /^[A-Z]\d*$/.test(label)));
  });

  it("finds dictionary rhymes and excludes the search word itself", () => {
    const nightRhymes = findRhymes("Night!");
    assert.ok(Array.isArray(nightRhymes));
    assert.ok(nightRhymes.includes("light"));
    assert.ok(!nightRhymes.includes("night"));
    assert.equal(findRhymes("   "), null);
  });

  it("calculates bar totals, formats structure export, and reorders sections safely", () => {
    const sections = [
      { name: "Intro", bars: 4, notes: "Sparse piano" },
      { name: "Verse 1", bars: 8, notes: "" },
      { name: "Chorus", bars: 8, notes: "Full band" },
    ];
    assert.equal(calculateTotalBars(sections), 20);

    const exported = formatStructureExport(sections);
    assert.match(exported, /Total: 20 bars/);
    assert.match(exported, /\[1\] Intro — 4 bars/);
    assert.match(exported, /Sparse piano/);

    const reordered = reorderItems(sections, 2, 0);
    assert.deepEqual(
      reordered.map((s) => s.name),
      ["Chorus", "Intro", "Verse 1"],
    );
    assert.deepEqual(reorderItems(sections, -1, 1), sections);
  });

  it("sanitizes external URLs and blocks unsafe schemes", () => {
    assert.equal(
      sanitizeExternalUrl("https://suno.com/song/higher-fire"),
      "https://suno.com/song/higher-fire",
    );
    assert.equal(sanitizeExternalUrl("http://example.com/demo"), "http://example.com/demo");
    assert.equal(sanitizeExternalUrl("javascript:alert(1)"), null);
    assert.equal(sanitizeExternalUrl("data:text/html,<h1>hi</h1>"), null);
    assert.equal(sanitizeExternalUrl("not a url"), null);
    assert.equal(sanitizeExternalUrl(""), null);
  });

  it("generates structured song concepts deterministically when given an RNG", () => {
    const concept = generateSongConcept({
      genre: "Soul",
      mood: "Hopeful",
      bpmMin: "88",
      bpmMax: "96",
      theme: "higher fire",
      selectedInsts: ["Guitar", "Organ"],
      id: "fixed-id",
      date: "2026-11-19T00:00:00.000Z",
      rng: () => 0.25,
    });

    assert.equal(concept.id, "fixed-id");
    assert.equal(concept.bpmRange, "88-96");
    assert.equal(concept.titles.length, 3);
    assert.equal(concept.verseThemes.length, 3);
    assert.equal(concept.referenceArtists.length, 3);
    assert.ok(concept.hookIdea.length > 10);
    assert.ok(concept.productionNotes.length > 10);
  });
});
