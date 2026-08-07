import React from 'react';

/** Marchio San Martino 2030 — il campanile sulla valle, nel doppio cerchio oro. */
export default function Mark2030({ className = '', gold = '#E0BF5C' }: { className?: string; gold?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45.5" stroke={gold} strokeWidth="1.1" />
      <circle cx="50" cy="50" r="40" stroke={gold} strokeWidth="0.37" />
      {/* profilo delle colline */}
      <path d="M 15 66 L 30 56 L 40 61 L 60 61 L 72 53 L 85 63"
        stroke={gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* campanile */}
      <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 45 61 L 45 34 L 50 28 L 55 34 L 55 61" />
        <path d="M 47.6 40 L 52.4 40" />
        {/* bifora */}
        <path d="M 47.8 48 L 47.8 44.6 Q 50 43 52.2 44.6 L 52.2 48" />
        <path d="M 50 44.2 L 50 48" strokeWidth="1.2" />
      </g>
      {/* la stella del mattino sopra la cuspide */}
      <g stroke={gold} strokeWidth="1.1" strokeLinecap="round">
        <path d="M 50 20.5 L 50 24.5" />
        <path d="M 48 22.5 L 52 22.5" />
      </g>
    </svg>
  );
}
