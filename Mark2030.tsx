import React from 'react';

/** Marchio San Martino 2030 — "Il crinale che parla": onda sonora che disegna il profilo del monte. */
export default function Mark2030({ className = '', gold = '#E0BF5C' }: { className?: string; gold?: string }) {
  const alt = [16, 26, 38, 55, 42, 30, 20];
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45" stroke={gold} strokeWidth="2.5" />
      {alt.map((h, i) => {
        const cx = 50 + (i - 3) * 11.5;
        return (
          <rect key={i} x={cx - 2.6} y={70 - h} width="5.2" height={h} rx="2.6"
            fill={i === 3 ? gold : 'currentColor'} />
        );
      })}
      <line x1="40" y1="82" x2="60" y2="82" stroke="#A8322A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
