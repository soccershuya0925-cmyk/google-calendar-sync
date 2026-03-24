"use client";

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './page.module.css';

const EVENT_COLORS = [
  { id: '', hex: '#4285f4', label: 'デフォルト (青)' },
  { id: '1', hex: '#7986cb', label: 'ラベンダー' },
  { id: '2', hex: '#33b679', label: 'セージ (緑)' },
  { id: '3', hex: '#8e24aa', label: 'グレープ (紫)' },
  { id: '4', hex: '#e67c73', label: 'フラミンゴ (ピンク)' },
  { id: '5', hex: '#f6c026', label: 'バナナ (黄)' },
  { id: '6', hex: '#f4511e', label: 'タンジェリン (オレンジ)' },
  { id: '7', hex: '#039be5', label: 'ピーコック (水色)' },
  { id: '8', hex: '#616161', label: 'グラファイト (灰)' },
  { id: '9', hex: '#3f51b5', label: 'ブルーベリー (濃い青)' },
  { id: '10', hex: '#0b8043', label: 'バジル (濃い緑)' },
  { id: '11', hex: '#d50000', label: 'トマト (赤)' },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState([new Date().toISOString().split('T')[0]]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [endTimeTbd, setEndTimeTbd] = useState(false);
  const [description, setDescription] = useState('');
  const [colorId, setColorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          dates,
          startTime,
          endTime: endTimeTbd ? startTime : endTime,
          description,
          colorId
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: `🎉 ${dates.length}件の予定をGoogleカレンダーに追加しました！`, type: 'success' });
        setTitle('');
        setDescription('');
        setColorId('');
        setEndTimeTbd(false);
        setDates([new Date().toISOString().split('T')[0]]);
        // Reset times slightly for next input
        setStartTime(endTime);
        const autoEndHour = (parseInt(endTime.split(':')[0]) + 1).toString().padStart(2, '0');
        setEndTime(`${autoEndHour}:${endTime.split(':')[1]}`);
      } else {
        setMessage({ text: `エラー: ${data.error}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '同期に失敗しました。', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.glassForm} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Add to Calendar</h1>
        
        {status === 'unauthenticated' && (
          <div className={styles.authMessage}>
            Googleカレンダーに予定を追加するには<br />ログインが必要です。
          </div>
        )}

        {message.text && (
          <div style={{ padding: 12, borderRadius: 8, background: message.type === 'success' ? '#10b98122' : '#ef444422', color: message.type === 'success' ? '#10b981' : '#ef4444', textAlign: 'center', fontWeight: 500, fontSize: '0.9rem' }}>
            {message.text}
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label}>予定のタイトル / Title</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="例: クライアントと打ち合わせ" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={status !== 'authenticated'}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>日付 / Dates</label>
          {dates.map((d, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input 
                type="date" 
                className={styles.input} 
                value={d} 
                onChange={e => {
                  const newDates = [...dates];
                  newDates[index] = e.target.value;
                  setDates(newDates);
                }}
                required
                disabled={status !== 'authenticated'}
              />
              {dates.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => setDates(dates.filter((_, i) => i !== index))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.5rem', padding: '0 8px' }}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setDates([...dates, dates[dates.length - 1]])}
            style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
            disabled={status !== 'authenticated'}
          >
            + 日付を追加
          </button>
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label}>開始 / Start</label>
            <input 
              type="time" 
              className={styles.input} 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)}
              required
              disabled={status !== 'authenticated'}
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>終了 / End</span>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                <input 
                  type="checkbox" 
                  checked={endTimeTbd} 
                  onChange={e => setEndTimeTbd(e.target.checked)} 
                  disabled={status !== 'authenticated'}
                /> 未定
              </label>
            </label>
            <input 
              type="time" 
              className={styles.input} 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)}
              required={!endTimeTbd}
              disabled={status !== 'authenticated' || endTimeTbd}
              style={{ opacity: endTimeTbd ? 0.5 : 1 }}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>詳細 (メモ) / Description</label>
          <textarea 
            className={styles.textarea} 
            placeholder="場所やURL、確認事項など..." 
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={status !== 'authenticated'}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>予定の色 / Color</label>
          <div className={styles.colorPicker}>
            {EVENT_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.colorBtn} ${colorId === c.id ? styles.colorBtnSelected : ''}`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
                onClick={() => setColorId(c.id)}
                disabled={status !== 'authenticated'}
              />
            ))}
          </div>
        </div>

        {status === 'authenticated' ? (
          <button type="submit" className={styles.submitBtn} disabled={loading || !title}>
            {loading ? '送信中...' : 'カレンダーに追加'}
          </button>
        ) : (
          <button type="button" className={styles.submitBtn} onClick={() => signIn('google')} disabled={status === 'loading'}>
            Googleでログイン
          </button>
        )}
      </form>
    </div>
  );
}
