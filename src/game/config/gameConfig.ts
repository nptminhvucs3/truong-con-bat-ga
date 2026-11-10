/** Mọi thông số gameplay tập trung tại đây. */
export const GAME_CONFIG = {
  world: { width: 1280, height: 720 },
  chicken: { speed: 70, runSpeed: 190 },
  truongCon: { speed: 150, runSpeed: 300 },
  catchDistance: 58,
  panicRadius: 280,           // gà trong bán kính này sẽ hoảng loạn bỏ chạy khỏi Trường Con
  switchAfterMissChance: 0.6, // bắt hụt: xác suất chuyển sang lùa con khác (không bám con vừa hụt)
  chaseBoostAfterMs: 6000, // đuổi quá lâu thì Trường Con tăng tốc dần
  catchMissChance: 0.2,
  escapeChance: 0.6,
  maxPotAttempts: 3,
  potShakeMs: { min: 2500, max: 4500 },
  roundDelayMs: 1200,
  timing: {
    preparingMs: 600,
    chickensRunningMs: 2500,
    catchAnimMs: 550,
    missStunMs: 1500,
    escapeAnimMs: 1800,
    cookedRevealMs: 3000,
  },
  defaultVolume: 0.7,
} as const;

/** Đường dẫn asset tập trung (tương đối với public/, dùng BASE_URL để chạy trên subpath). */
const base = import.meta.env.BASE_URL;
export const ASSETS = {
  truongCon: `${base}assets/characters/truong-con/truong-con.png`,
  plateChicken: `${base}assets/objects/plate-chicken.png`,
} as const;
