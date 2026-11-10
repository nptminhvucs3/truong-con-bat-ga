import type { SfxKey } from '../managers/AudioManager';

/**
 * Cấu hình file âm thanh của bạn (đặt file vào public/assets/audio/).
 * Mặc định để trống: game dùng âm thanh tổng hợp sẵn (không bản quyền) nên không báo lỗi.
 * Muốn dùng file riêng (ví dụ âm thanh meme), bỏ comment và sửa tên file, ví dụ:
 *   meme: 'truong-con-xuat-hien.mp3',
 *   bgm: 'nhac-nen.mp3',
 */
export const AUDIO_FILES: Partial<Record<SfxKey, string>> = {
  // bgm: 'bgm.mp3',
  // cluck: 'ga-keu.mp3',
  // flap: 'canh-vo.mp3',
  // meme: 'meme.mp3',
  // miss: 'bat-hut.mp3',
  // catch: 'bat-duoc.mp3',
  // rattle: 'noi-rung.mp3',
  // lidPop: 'nap-noi-bat.mp3',
  // win: 'chien-thang.mp3',
  // sad: 'that-bai.mp3',
  // boing: 'boing.mp3',
  // fall: 'nga.mp3',
};
