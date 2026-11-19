type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx || sharedCtx.state === "closed") {
      const Ctx =
        window.AudioContext ||
        (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!Ctx) return null;
      sharedCtx = new Ctx();
    }
    if (sharedCtx.state === "suspended") {
      void sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export const playChord = (frequencies: number[], duration = 1.5) => {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;

  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.28, audioCtx.currentTime + 0.015);
  masterGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );

  frequencies.forEach((freq, i) => {
    const noteGain = audioCtx.createGain();
    noteGain.gain.value = i === 0 ? 0.6 : 0.4;
    noteGain.connect(masterGain);

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.connect(noteGain);

    const osc1 = audioCtx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc1.connect(compressor);

    const osc2 = audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, audioCtx.currentTime);
    const osc2Gain = audioCtx.createGain();
    osc2Gain.gain.value = 0.18;
    osc2.connect(osc2Gain);
    osc2Gain.connect(compressor);

    const osc3 = audioCtx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 0.5, audioCtx.currentTime);
    const osc3Gain = audioCtx.createGain();
    osc3Gain.gain.value = 0.12;
    osc3.connect(osc3Gain);
    osc3Gain.connect(compressor);

    osc1.start(audioCtx.currentTime);
    osc2.start(audioCtx.currentTime);
    osc3.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + duration);
    osc2.stop(audioCtx.currentTime + duration);
    osc3.stop(audioCtx.currentTime + duration);
  });
};

export const playNote = (freq: number, duration = 0.8) => {
  playChord([freq], duration);
};

export const NOTES: Record<string, number> = {
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61,
  "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23,
  "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.26, "F5": 698.46,
  "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
};
