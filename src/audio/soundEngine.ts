class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClick(freq = 1200) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch (_) {}
  }

  public playDialTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.018);
    } catch (_) {}
  }

  public playSonarPing() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, t);
      osc1.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, t);
      osc2.frequency.exponentialRampToValueAtTime(880, t + 0.25);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.65);
      osc2.stop(t + 0.65);
    } catch (_) {}
  }

  public playModeChange() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.095);
    } catch (_) {}
  }

  /**
   * Sound effect: "Cekring" (authentic cash register / coin clink + resonant bell chime)
   * Plays on price movement ($1 ticks), target price hits, and manual test.
   */
  public playCekring() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Initial "Cek" / Mechanical Coin Strike (fast dual clink)
      const strikeFrequencies = [2400, 3100];
      strikeFrequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const strikeOsc = this.ctx.createOscillator();
        const strikeGain = this.ctx.createGain();
        const strikeTime = t + idx * 0.032;

        strikeOsc.type = 'triangle';
        strikeOsc.frequency.setValueAtTime(freq, strikeTime);
        strikeOsc.frequency.exponentialRampToValueAtTime(750, strikeTime + 0.04);

        strikeGain.gain.setValueAtTime(0.18, strikeTime);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.045);

        strikeOsc.connect(strikeGain);
        strikeGain.connect(this.ctx.destination);

        strikeOsc.start(strikeTime);
        strikeOsc.stop(strikeTime + 0.05);
      });

      // 2. Resonant "Kriiing" Metallic Bell Chime Chord (E6, G#6, B6, E7, B7)
      const bellFreqs = [1318.5, 1661.2, 1975.5, 2637.0, 3951.0];
      bellFreqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const ringStart = t + 0.026;

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        const detune = (i - 2) * 3.5;
        osc.frequency.setValueAtTime(freq + detune, ringStart);

        const initialVol = 0.14 / (1 + i * 0.28);
        gain.gain.setValueAtTime(initialVol, ringStart);
        gain.gain.exponentialRampToValueAtTime(0.0004, ringStart + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ringStart);
        osc.stop(ringStart + 0.9);
      });
    } catch (_) {}
  }
}

export const sound = new SoundEngine();
