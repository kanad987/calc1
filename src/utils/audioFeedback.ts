// Web Audio API Sound Synthesizer & Speech for Grade 3 Kid-friendly tactile feedback

class AudioFeedbackManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public speechEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Playful pop / bubble sound for number keys
  public playBubble(freq = 520) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // safe fallback
    }
  }

  // Bouncy spring / boing sound for operator keys (+, -, ×, ÷)
  public playBoing() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // safe fallback
    }
  }

  // Celebratory major arpeggio fanfare for '=' and quiz wins!
  public playFanfare() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const noteDuration = 0.09;
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.12, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration + 0.06);
      });
    } catch {
      // safe fallback
    }
  }

  // Cartoon swoosh / water drop for Clear
  public playClear() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // safe fallback
    }
  }

  // Gentle friendly "oops" wobble tone for errors
  public playError() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.08);
      osc.frequency.linearRampToValueAtTime(180, now + 0.16);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // safe fallback
    }
  }

  // Backwards compatibility
  public playClick(frequency = 600) {
    this.playBubble(frequency);
  }

  public playEquals() {
    this.playFanfare();
  }

  // Speech synthesis reading equation and answer aloud
  public speakMath(text: string) {
    if (!this.speechEnabled || typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop prior speech
        
        // Clean speech text for friendly child speech
        const speechFriendly = text
          .replace(/×/g, ' times ')
          .replace(/\*/g, ' times ')
          .replace(/÷/g, ' divided by ')
          .replace(/\//g, ' divided by ')
          .replace(/−/g, ' minus ')
          .replace(/-/g, ' minus ')
          .replace(/\+/g, ' plus ')
          .replace(/=/g, ' equals ')
          .replace(/\b([0-9]+)\s*R\s*([0-9]+)\b/gi, '$1 with remainder $2');

        const utterance = new SpeechSynthesisUtterance(speechFriendly);
        utterance.rate = 0.92; // Slightly relaxed for clarity
        utterance.pitch = 1.15; // Cheerful, friendly pitch
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech may fail if permissions or voices are unavailable
    }
  }
}

export const audioFeedback = new AudioFeedbackManager();
