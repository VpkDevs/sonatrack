export const playChord = (frequencies: number[], duration = 1.5) => {
  if (typeof window === "undefined" || !window.AudioContext) return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  
  // Fade out
  masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  frequencies.forEach(freq => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Add some warmth with a triangle wave an octave down
    const osc2 = audioCtx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq / 2, audioCtx.currentTime);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    
    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start();
    osc2.start();
    
    osc.stop(audioCtx.currentTime + duration);
    osc2.stop(audioCtx.currentTime + duration);
  });

  setTimeout(() => {
    audioCtx.close();
  }, duration * 1000 + 100);
};

// Map note names to frequencies (C3 to B4)
export const NOTES: Record<string, number> = {
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61,
  "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23,
  "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88
};
