import Phaser from 'phaser';

export type TCAnim =
  | 'idle' | 'walk' | 'run' | 'catch' | 'miss' | 'carry'
  | 'putInPot' | 'holdPot' | 'surprise' | 'frustrated' | 'victory';
export type TCMood = 'normal' | 'rage' | 'shock' | 'sad' | 'smug' | 'dizzy' | 'excited' | 'strain';

const DEFAULT_MOOD: Record<TCAnim, TCMood> = {
  idle: 'normal', walk: 'normal', run: 'smug', catch: 'normal', miss: 'dizzy', carry: 'smug',
  putInPot: 'smug', holdPot: 'strain', surprise: 'shock', frustrated: 'rage', victory: 'excited',
};
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
type OverlayKey = 'anger' | 'bang' | 'sweat' | 'glint' | 'tearL' | 'tearR' | 'star0' | 'star1' | 'star2' | 'spark0' | 'spark1';

/**
 * Nhân vật chính. Dùng đúng ảnh đã chốt (không vẽ lại, không lật ảnh).
 * Biểu cảm hài hước tạo bằng: nghiêng/nhún/ngã sấp, đổi sắc da (tint), và các icon meme
 * phủ lên (💢 ❗ 💦 ✨ 💧 ⭐) bám theo thân người.
 */
export class TruongCon extends Phaser.GameObjects.Container {
  readonly rig: Phaser.GameObjects.Container; // thân + icon, được nghiêng/nhún theo animation
  readonly sprite: Phaser.GameObjects.Image;
  readonly baseScale: number;
  anim: TCAnim = 'idle';
  mood: TCMood = 'normal';
  facing = 1;
  private animT = 0;
  private moodT = 0;
  private ov!: Record<OverlayKey, Phaser.GameObjects.Text>;

  constructor(scene: Phaser.Scene, x: number, y: number, height = 230) {
    super(scene, x, y);
    const shadow = scene.add.ellipse(0, -2, 120, 26, 0x000000, 0.3);
    this.sprite = scene.add.image(0, 0, 'truongCon').setOrigin(0.5, 1);
    this.baseScale = height / this.sprite.height;
    this.sprite.setScale(this.baseScale);
    this.rig = scene.add.container(0, 0, [this.sprite]);

    const mk = (ch: string, size: number) => {
      const t = scene.add.text(0, 0, ch, { fontFamily: EMOJI_FONT, fontSize: `${size}px` }).setOrigin(0.5).setVisible(false);
      this.rig.add(t);
      return t;
    };
    this.ov = {
      anger: mk('💢', 40), bang: mk('❗', 46), sweat: mk('💦', 34), glint: mk('✨', 34),
      tearL: mk('💧', 28), tearR: mk('💧', 28),
      star0: mk('⭐', 28), star1: mk('⭐', 28), star2: mk('⭐', 28),
      spark0: mk('✨', 34), spark1: mk('✨', 34),
    };

    this.add([shadow, this.rig]);
    scene.add.existing(this);
    this.setDepth(y);
  }

  setAnim(a: TCAnim, mood?: TCMood): void {
    if (this.anim !== a) { this.anim = a; this.animT = 0; }
    this.setMood(mood ?? DEFAULT_MOOD[a]);
  }

  setMood(m: TCMood): void {
    if (m === this.mood) return;
    this.mood = m;
    this.moodT = 0;
    for (const k of Object.keys(this.ov) as OverlayKey[]) this.ov[k].setVisible(false).setAlpha(1);
    if (m === 'rage') this.sprite.setTint(0xff7a7a);
    else if (m === 'shock') this.sprite.setTint(0xcfe0ff);
    else if (m === 'sad') this.sprite.setTint(0xb4c4e0);
    else this.sprite.clearTint();
  }

  face(dx: number): void {
    if (Math.abs(dx) > 1) this.facing = dx > 0 ? 1 : -1;
  }

  /** Di chuyển từ từ về đích (không dịch chuyển tức thời). Trả về true khi đã tới. */
  moveToward(tx: number, ty: number, speed: number, dt: number): boolean {
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    this.face(dx);
    if (d < 4) return true;
    const step = Math.min(d, speed * dt / 1000);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    this.setDepth(this.y);
    return d - step < 4;
  }

  tick(dt: number): void {
    this.animT += dt / 1000;
    this.moodT += dt / 1000;
    const t = this.animT, f = this.facing;
    let angle = 0, y = 0, sx = 1, sy = 1, ox = 0;
    switch (this.anim) {
      case 'idle': sy = 1 + Math.sin(t * 3.5) * 0.02; sx = 1 - Math.sin(t * 3.5) * 0.008; break;
      case 'walk': y = -Math.abs(Math.sin(t * 9)) * 6; angle = Math.sin(t * 9) * 3; break;
      case 'carry': y = -Math.abs(Math.sin(t * 9)) * 6; angle = Math.sin(t * 9) * 3 - f * 3; break;
      case 'run': y = -Math.abs(Math.sin(t * 15)) * 12; angle = f * 9 + Math.sin(t * 15) * 3; sy = 1 + Math.sin(t * 30) * 0.015; break;
      case 'catch': { const p = Math.min(1, t / 0.3); angle = f * 32 * p; sy = 1 - 0.08 * p; ox = f * 18 * p; break; }
      case 'miss': { // ngã sấp mặt rồi bò dậy
        const fall = Math.min(1, t / 0.18);
        const rise = Math.min(1, Math.max(0, (t - 1.05) / 0.3));
        const k = fall * (1 - rise);
        angle = f * 86 * k; ox = f * 34 * k; sy = 1 - 0.04 * k; break;
      }
      case 'putInPot': angle = f * 16 + Math.sin(t * 8) * 2; y = -Math.abs(Math.sin(t * 6)) * 4; break;
      case 'holdPot': angle = f * 10; ox = Math.sin(t * 35) * 2.5; y = Math.sin(t * 28) * 2; break;
      case 'surprise': y = -Math.sin(Math.min(1, t / 0.4) * Math.PI) * 26; sy = 1 + 0.08 * Math.max(0, 1 - t * 3); angle = Math.sin(t * 30) * 4 * Math.max(0, 1 - t); break;
      case 'frustrated': angle = Math.sin(t * 22) * 5; sy = 0.97; ox = Math.sin(t * 22) * 3; break;
      case 'victory': y = -Math.abs(Math.sin(t * 6)) * 42; sy = 1 + Math.sin(t * 12) * 0.03; angle = Math.sin(t * 6) * 8; break;
    }

    // Biểu cảm (mood)
    const m = this.moodT, o = this.ov;
    switch (this.mood) {
      case 'rage':
        o.anger.setVisible(true).setPosition(46, -218).setScale(1 + 0.25 * Math.abs(Math.sin(m * 10)));
        ox += Math.sin(m * 55) * 2.2;
        break;
      case 'shock':
        o.bang.setVisible(true).setPosition(0, -266 - Math.abs(Math.sin(m * 8)) * 6);
        sy *= 1 + 0.03 * Math.sin(m * 40);
        break;
      case 'strain': {
        const p = (m * 70) % 46;
        o.sweat.setVisible(true).setPosition(46, -196 + p).setAlpha(1 - p / 46);
        break;
      }
      case 'sad': {
        const p = (m * 90) % 70;
        o.tearL.setVisible(true).setPosition(-30, -150 + p).setAlpha(1 - p / 70);
        o.tearR.setVisible(true).setPosition(30, -150 + ((m * 90 + 35) % 70)).setAlpha(1 - ((m * 90 + 35) % 70) / 70);
        sy *= 0.96; angle += -f * 2;
        break;
      }
      case 'smug': {
        const c = m % 1.6;
        if (c < 0.55) o.glint.setVisible(true).setPosition(-46 + (c / 0.55) * 92, -158);
        else o.glint.setVisible(false);
        angle += -f * 2;
        break;
      }
      case 'dizzy':
        [o.star0, o.star1, o.star2].forEach((s, i) => {
          const a = m * 6 + i * 2.094;
          s.setVisible(true).setPosition(Math.cos(a) * 46, -236 + Math.sin(a) * 12);
        });
        break;
      case 'excited':
        o.spark0.setVisible(true).setPosition(-74, -200 + Math.sin(m * 6) * 10);
        o.spark1.setVisible(true).setPosition(74, -170 + Math.sin(m * 6 + 2) * 10);
        break;
      default: break;
    }

    this.rig.setPosition(ox, y);
    this.rig.setAngle(angle);
    this.rig.setScale(sx, sy);
  }
}
