import { AUDIO_FILES } from '../config/audioConfig';

export type SfxKey =
  | 'bgm' | 'cluck' | 'flap' | 'meme' | 'miss' | 'catch'
  | 'rattle' | 'lidPop' | 'win' | 'sad' | 'boing' | 'fall';

/**
 * Âm thanh bằng Web Audio. Có file thì dùng file (audioConfig.ts), không có thì
 * dùng âm thanh tổng hợp tự tạo bằng code (không bản quyền). Không bao giờ ném lỗi.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private files = new Map<SfxKey, AudioBuffer>();
  private bgmSrc: AudioBufferSourceNode | null = null;
  private enabled = true;
  private volume = 0.7;
  private bgmWanted = false;
  private paused = false;

  /** Gọi trong một thao tác bấm của người dùng (trình duyệt yêu cầu mới được phát tiếng). */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.paused) void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try { this.ctx = new Ctor(); } catch { return; }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? this.volume : 0;
    this.master.connect(this.ctx.destination);
    const n = this.ctx.sampleRate;
    this.noiseBuf = this.ctx.createBuffer(1, n, n);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    void this.loadFiles();
    if (this.bgmWanted) this.startBgm();
  }

  configure(soundOn: boolean, volume: number): void {
    this.enabled = soundOn;
    this.volume = volume;
    if (this.master) this.master.gain.value = soundOn ? volume : 0;
    if (!soundOn) this.stopBgmNode();
    else if (this.bgmWanted) this.startBgm();
  }

  /** Tạm dừng/tiếp tục toàn bộ âm thanh (nhạc nền + hiệu ứng). */
  setPaused(p: boolean): void {
    this.paused = p;
    if (!this.ctx) return;
    if (p) void this.ctx.suspend(); else void this.ctx.resume();
  }

  startBgm(): void {
    this.bgmWanted = true;
    if (!this.ctx || !this.master || !this.enabled || this.bgmSrc) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.files.get('bgm') ?? this.makeBgm();
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = this.files.has('bgm') ? 1 : 0.32;
    src.connect(g); g.connect(this.master);
    src.start();
    this.bgmSrc = src;
  }

  stopBgm(): void { this.bgmWanted = false; this.stopBgmNode(); }

  private stopBgmNode(): void {
    if (!this.bgmSrc) return;
    try { this.bgmSrc.stop(); } catch { /* đã dừng */ }
    this.bgmSrc = null;
  }

  play(key: SfxKey): void {
    const c = this.ctx;
    if (!c || !this.master || !this.enabled || this.paused || key === 'bgm') return;
    const buf = this.files.get(key);
    if (buf) {
      const s = c.createBufferSource();
      s.buffer = buf; s.connect(this.master); s.start();
      return;
    }
    this.synth(key);
  }

  // ---------- nạp file (nếu có cấu hình) ----------
  private async loadFiles(): Promise<void> {
    const c = this.ctx;
    if (!c) return;
    const base = import.meta.env.BASE_URL;
    for (const [k, file] of Object.entries(AUDIO_FILES) as Array<[SfxKey, string]>) {
      try {
        const res = await fetch(`${base}assets/audio/${file}`);
        const type = res.headers.get('content-type') ?? '';
        if (!res.ok || type.includes('text/html')) continue;
        this.files.set(k, await c.decodeAudioData(await res.arrayBuffer()));
      } catch { /* thiếu file: dùng âm thanh tổng hợp */ }
    }
  }

  // ---------- âm thanh tổng hợp ----------
  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0): void {
    const c = this.ctx!, now = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, now);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(this.master!);
    o.start(now); o.stop(now + dur + 0.03);
  }

  private noise(dur: number, vol: number, hp: number, delay = 0): void {
    const c = this.ctx!, now = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f); f.connect(g); g.connect(this.master!);
    src.start(now, Math.random() * 0.5, dur + 0.02);
  }

  private synth(key: SfxKey): void {
    switch (key) {
      case 'cluck': {
        const p = 0.85 + Math.random() * 0.35;
        this.tone('square', 700 * p, 420 * p, 0.07, 0.07);
        this.tone('square', 540 * p, 380 * p, 0.08, 0.06, 0.09);
        break;
      }
      case 'flap': this.noise(0.09, 0.18, 1200); break;
      case 'meme':
        this.tone('square', 523, 523, 0.12, 0.12);
        this.tone('square', 659, 659, 0.12, 0.12, 0.12);
        this.tone('square', 784, 784, 0.12, 0.12, 0.24);
        this.tone('square', 1047, 1047, 0.32, 0.14, 0.36);
        break;
      case 'miss':
        this.tone('sawtooth', 420, 110, 0.6, 0.14);
        this.tone('sawtooth', 432, 116, 0.6, 0.08);
        break;
      case 'catch':
        this.tone('sine', 300, 900, 0.18, 0.22);
        this.noise(0.05, 0.12, 2000);
        break;
      case 'rattle':
        this.noise(0.07, 0.22, 400);
        this.tone('square', 140, 110, 0.06, 0.1);
        break;
      case 'lidPop':
        this.noise(0.18, 0.28, 300);
        this.tone('sine', 220, 60, 0.22, 0.3);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.22, 0.2, i * 0.12));
        break;
      case 'sad':
        this.tone('triangle', 392, 370, 0.3, 0.2);
        this.tone('triangle', 370, 349, 0.3, 0.2, 0.3);
        this.tone('triangle', 349, 330, 0.3, 0.2, 0.6);
        this.tone('triangle', 330, 196, 0.6, 0.2, 0.9);
        break;
      case 'boing': this.tone('sine', 200, 700, 0.25, 0.22); break;
      case 'fall':
        this.tone('sine', 500, 80, 0.28, 0.28);
        this.noise(0.1, 0.25, 500, 0.2);
        break;
      default: break;
    }
  }

  /** Nhạc nền vui nhộn tự sinh (vòng lặp ~7 giây), không dùng nguồn bên ngoài. */
  private makeBgm(): AudioBuffer {
    const c = this.ctx!;
    const sr = 22050, step = 0.2273; // 132 bpm, nốt móc đơn
    const melody = [72,0,76,0,79,0,76,72, 74,0,77,0,81,0,77,74, 76,0,79,0,83,0,79,76, 74,76,72,0,67,0,72,0];
    const bass = [48,48,55,55,53,53,55,55];
    const len = Math.floor(sr * step * melody.length);
    const buf = c.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
    const tri = (ph: number) => 2 * Math.abs(2 * (ph - Math.floor(ph + 0.5))) - 1;
    for (let i = 0; i < melody.length; i++) {
      const s0 = Math.floor(i * step * sr), n = Math.floor(step * sr);
      if (melody[i]) {
        const f = hz(melody[i]);
        for (let k = 0; k < n && s0 + k < len; k++) d[s0 + k] += tri((k / sr) * f) * Math.exp(-k / sr * 7) * 0.5;
      }
      if (i % 4 === 0) {
        const f = hz(bass[i / 4]);
        for (let k = 0; k < n * 4 && s0 + k < len; k++) {
          const ph = (k / sr) * f;
          d[s0 + k] += (ph - Math.floor(ph) < 0.5 ? 1 : -1) * Math.exp(-k / sr * 3) * 0.16;
        }
      }
      if (i % 2 === 1) {
        for (let k = 0; k < n * 0.25 && s0 + k < len; k++) d[s0 + k] += (Math.random() * 2 - 1) * Math.exp(-k / sr * 60) * 0.1;
      }
    }
    return buf;
  }
}

export const audio = new AudioManager();
