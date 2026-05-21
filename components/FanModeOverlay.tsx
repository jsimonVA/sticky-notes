'use client';

import { useState, useEffect } from 'react';
import { Note, NoteColor } from '@/types';

const headerColors: Record<NoteColor, string> = {
  yellow: '#fde68a',
  blue:   '#bfdbfe',
  green:  '#bbf7d0',
  pink:   '#fbcfe8',
  purple: '#e9d5ff',
  orange: '#fed7aa',
};

const bgColors: Record<NoteColor, string> = {
  yellow: '#fefce8',
  blue:   '#eff6ff',
  green:  '#f0fdf4',
  pink:   '#fdf2f8',
  purple: '#faf5ff',
  orange: '#fff7ed',
};

interface Props {
  note: Note;
  rect: DOMRect;
  onComplete: () => void;
}

export default function FanModeOverlay({ note, rect, onComplete }: Props) {
  const [blowing, setBlowing] = useState(false);

  // Direction: fan is at screen center, note flies outward from there
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const dx = (rect.left + rect.width / 2) - screenW / 2;
  const dy = (rect.top + rect.height / 2) - screenH / 2;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const flyX = (dx / len) * (Math.max(screenW, screenH) * 1.9);
  const flyY = (dy / len) * (Math.max(screenW, screenH) * 1.9);
  const flyRotation = Math.atan2(dy, dx) * (180 / Math.PI) + 25;

  useEffect(() => {
    const t1 = setTimeout(() => setBlowing(true), 750);
    const t2 = setTimeout(onComplete, 1650);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  const noteStyle: React.CSSProperties = blowing
    ? {
        transform: `translate(${flyX}px, ${flyY}px) rotate(${flyRotation}deg) scale(0.15)`,
        opacity: 0,
        transition: 'transform 0.85s cubic-bezier(0.3, 0, 0.9, 0.4), opacity 0.75s ease-in 0.05s',
      }
    : {
        transform: 'none',
        opacity: 1,
      };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200]"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)', animation: 'fade-in 0.25s ease-out' }}
      />

      {/* Fan — centered on screen */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none">
        <FanGraphic blowing={blowing} />
      </div>

      {/* Note ghost at original screen position */}
      <div
        className="fixed z-[202] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          minHeight: rect.height,
          backgroundColor: bgColors[note.color],
          border: `2px solid ${headerColors[note.color]}`,
          ...noteStyle,
        }}
      >
        <div
          className="px-4 py-3 font-semibold text-sm text-gray-800"
          style={{ backgroundColor: headerColors[note.color] }}
        >
          {note.title || 'Untitled'}
        </div>
        {note.body && (
          <div className="px-4 py-3 text-sm text-gray-700 leading-relaxed">
            {note.body}
          </div>
        )}
      </div>
    </>
  );
}

function FanGraphic({ blowing }: { blowing: boolean }) {
  return (
    // Fixed-size container: wind rings and SVG all share this 240×240 box,
    // so they are guaranteed to stay co-centered.
    <div className="relative" style={{ width: 240, height: 240, flexShrink: 0 }}>
      {/* Expanding wind rings — absolute inset-0 keeps them centered in the box */}
      {blowing &&
        [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-[3px] border-indigo-300"
            style={{
              opacity: 0,
              animation: `wind-ring 0.85s ease-out ${i * 0.17}s infinite`,
            }}
          />
        ))}

      {/* Fan SVG — fills the 240×240 box exactly */}
      <svg
        width="240"
        height="240"
        viewBox="-120 -120 240 240"
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'fan-appear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <defs>
          <radialGradient id="bladeGrad" cx="50%" cy="80%" r="70%">
            <stop offset="0%"   stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </radialGradient>
        </defs>

        {/* Soft glow */}
        <circle r="100" fill="rgba(99,102,241,0.07)" />

        {/* Guard — outer ring */}
        <circle r="98" fill="none" stroke="#334155" strokeWidth="6" />

        {/* Guard — concentric inner rings */}
        <circle r="75" fill="none" stroke="#475569" strokeWidth="2" opacity="0.55" />
        <circle r="50" fill="none" stroke="#475569" strokeWidth="2" opacity="0.55" />
        <circle r="25" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.4" />

        {/* Guard — cross bars */}
        <line x1="-98" y1="0"   x2="98"  y2="0"   stroke="#475569" strokeWidth="2"   opacity="0.4" />
        <line x1="0"   y1="-98" x2="0"   y2="98"  stroke="#475569" strokeWidth="2"   opacity="0.4" />
        <line x1="-69" y1="-69" x2="69"  y2="69"  stroke="#475569" strokeWidth="1.2" opacity="0.25" />
        <line x1="69"  y1="-69" x2="-69" y2="69"  stroke="#475569" strokeWidth="1.2" opacity="0.25" />

        {/* Spinning blades — transform-box: fill-box makes transform-origin: center
            relative to the <g>'s own bounding box, not the SVG viewport */}
        <g
          style={{
            transformOrigin: 'center',
            transformBox: 'fill-box',
            animation: `fan-spin ${blowing ? '0.14s' : '0.55s'} linear infinite`,
          }}
        >
          {[0, 90, 180, 270].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-40"
              rx="22"
              ry="40"
              fill="url(#bladeGrad)"
              opacity="0.92"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Center hub */}
        <circle r="16" fill="#1e1b4b" />
        <circle r="10" fill="#6366f1" />
        <circle r="4"  fill="#c7d2fe" />
      </svg>
    </div>
  );
}
