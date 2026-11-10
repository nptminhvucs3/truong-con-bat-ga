export interface Student { id: string; name: string; }

export interface Settings {
  soundOn: boolean;
  volume: number;          // 0..1
  catchMissChance: number; // 0..1
  escapeChance: number;    // 0..1
  maxPotAttempts: number;
  nameMode: 'auto' | 'full' | 'short'; // cách hiển thị tên trên đầu gà
}

export interface RoundStats { attempts: number; maxAttempts: number; misses: number; }

export type GameState =
  | 'PREPARING' | 'CHICKENS_RUNNING' | 'CHARACTER_ENTERING' | 'CHASING'
  | 'CATCHING' | 'CARRYING' | 'PUTTING_IN_POT' | 'POT_SHAKING'
  | 'CHICKEN_ESCAPING' | 'CHICKEN_COOKED' | 'RESULT' | 'GAME_OVER';
