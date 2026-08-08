import React from 'react';

/** Marchio San Martino 2030 — monogramma SM in serif, doppio cerchio oro, tratto rosso. */
export default function Mark2030({ className = '', gold = '#E0BF5C' }: { className?: string; gold?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45" stroke={gold} strokeWidth="2.75" />
      <circle cx="50" cy="50" r="39" stroke={gold} strokeWidth="1" opacity="0.7" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central"
        fontFamily="Lora, Georgia, serif" fontSize="42" fontWeight="600" fill="currentColor">SM</text>
      <line x1="37" y1="71" x2="63" y2="71" stroke="#A8322A" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
