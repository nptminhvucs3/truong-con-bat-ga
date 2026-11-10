import { useState } from 'react';
import type { Student } from '../types';
import { ASSETS } from '../game/config/gameConfig';
import { parseStudentList } from '../game/managers/StudentManager';
import { StudentInput } from './StudentInput';

interface Props {
  text: string;
  onTextChange: (v: string) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onStart: (students: Student[]) => void;
}

export function MainMenu({ text, onTextChange, soundOn, onToggleSound, onOpenSettings, onStart }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const { students } = parseStudentList(text);
    if (students.length === 0) {
      setError('Danh sách đang trống! Hãy dán ít nhất một tên học sinh.');
      return;
    }
    setError(null);
    onStart(students);
  };

  return (
    <div className="menu-screen">
      <div className="menu-top">
        <button className="btn small" onClick={onToggleSound} aria-label="Bật/tắt âm thanh">{soundOn ? '🔊 Âm thanh: Bật' : '🔇 Âm thanh: Tắt'}</button>
        <button className="btn small" onClick={onOpenSettings}>⚙ Cài đặt</button>
      </div>
      <h1 className="title">TRƯỜNG CON<br />BẮT GÀ</h1>
      <div className="menu-card">
        <div className="menu-hero">
          <img src={ASSETS.truongCon} alt="Trường Con" />
        </div>
        <div className="menu-form">
          <StudentInput value={text} onChange={(v) => { setError(null); onTextChange(v); }} error={error} />
          <ol className="howto">
            <li>Copy cột tên học sinh từ Excel rồi dán vào ô trên.</li>
            <li>Bấm <b>BẮT ĐẦU</b>, Trường Con sẽ đuổi bắt gà.</li>
            <li>Con gà nào bị luộc chín, bạn đó được gọi tên!</li>
          </ol>
          <button className="btn big green" onClick={handleStart}>▶ BẮT ĐẦU</button>
        </div>
      </div>
    </div>
  );
}
