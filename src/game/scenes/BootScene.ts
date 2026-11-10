import Phaser from 'phaser';
import { ASSETS } from '../config/gameConfig';

/** Nạp tài nguyên. Thiếu ảnh thì tạo placeholder để game không bị lỗi. */
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('truongCon', ASSETS.truongCon);
    this.load.image('plateChicken', ASSETS.plateChicken);
  }

  create() {
    if (!this.textures.exists('truongCon') || this.textures.get('truongCon').key === '__MISSING') {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff).fillRoundedRect(0, 0, 160, 360, 20);
      g.lineStyle(4, 0x333333).strokeRoundedRect(0, 0, 160, 360, 20);
      g.generateTexture('truongCon', 160, 360);
      g.destroy();
    }
    this.scene.start('MainGameScene');
  }
}
