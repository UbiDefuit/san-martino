import React from 'react';

/** Marchio San Martino 2030 — monogramma SM in serif, doppio cerchio oro, tratto rosso. */
export default function Mark2030({ className = '', gold = '#E0BF5C' }: { className?: string; gold?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45.5" stroke={gold} strokeWidth="1.1" />
      <circle cx="50" cy="50" r="40" stroke={gold} strokeWidth="0.37" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central"
        fontFamily="Lora, Georgia, serif" fontSize="38" fill="currentColor">SM</text>
      <line x1="38" y1="70" x2="62" y2="70" stroke="#A8322A" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
