'use client';
// src/components/Toast.tsx
import { useEffect } from 'react';

export interface ToastMsg { id: number; text: string; type?: 'success'|'error'|'info'; }

interface Props {
  messages: ToastMsg[];
  onRemove: (id: number) => void;
}

export default function Toast({ messages, onRemove }: Props) {
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    const t = setTimeout(() => onRemove(last.id), 2100);
    return () => clearTimeout(t);
  }, [messages, onRemove]);

  return (
    <div className="toast-wrap">
      {messages.map(m => (
        <div key={m.id} className={`toast ${m.type || 'success'}`}>{m.text}</div>
      ))}
    </div>
  );
}
