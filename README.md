# Trường Con Bắt Gà

```
npm install
npm run dev        # chạy thử
npm run build      # kiểm tra TypeScript + build
```

- Ảnh nhân vật: `public/assets/characters/truong-con/truong-con.png` (nền trong suốt; thay file này để đổi ảnh).
- Thông số gameplay: `src/game/config/gameConfig.ts` (tốc độ, bán kính hoảng loạn của gà, xác suất chuyển sang lùa con khác sau khi bắt hụt...).
- Âm thanh: mặc định dùng âm thanh tự tổng hợp bằng code (không bản quyền). Muốn dùng file riêng (ví dụ nhạc meme),
  đặt file vào `public/assets/audio/` rồi bỏ comment và sửa tên trong `src/game/config/audioConfig.ts`.
