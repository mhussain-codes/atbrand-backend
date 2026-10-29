import React from 'react';

export default function GarmentPreview2D({
  collar = 'sherwani',
  neckline = 'placket',
  sleeves = 'cuff',
  daman = 'round',
  buttons = 'metal',
  color = '#2A4D38'
}) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-[#F5F2EB] p-6 shadow-inner">
      <div className="text-center mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C3A2B]/70">
          Interactive Tailoring Silhouette (2D)
        </span>
      </div>

      <svg
        viewBox="0 0 400 520"
        className="w-full max-w-[280px] drop-shadow-md transition-all duration-300"
      >
        <defs>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Kurta Body Base */}
        <path
          d={
            daman === 'round'
              ? "M 130 90 L 80 180 L 110 200 L 125 150 L 110 460 C 150 490, 250 490, 290 460 L 275 150 L 290 200 L 320 180 L 270 90 Z"
              : "M 130 90 L 80 180 L 110 200 L 125 150 L 110 470 L 290 470 L 275 150 L 290 200 L 320 180 L 270 90 Z"
          }
          fill={color}
          stroke="#11241B"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Sleeves Design */}
        {sleeves === 'cuff' ? (
          <>
            <rect x="75" y="180" width="35" height="18" rx="2" fill="#FAF8F5" stroke="#11241B" strokeWidth="2" />
            <rect x="290" y="180" width="35" height="18" rx="2" fill="#FAF8F5" stroke="#11241B" strokeWidth="2" />
            <circle cx="92" cy="189" r="2.5" fill={buttons === 'metal' ? '#C5A880' : '#222'} />
            <circle cx="308" cy="189" r="2.5" fill={buttons === 'metal' ? '#C5A880' : '#222'} />
          </>
        ) : (
          <>
            {/* Open Straight Sleeves */}
            <line x1="80" y1="180" x2="110" y2="200" stroke="#11241B" strokeWidth="3" />
            <line x1="290" y1="200" x2="320" y2="180" stroke="#11241B" strokeWidth="3" />
          </>
        )}

        {/* Collar Details */}
        {collar === 'sherwani' ? (
          <path
            d="M 160 90 C 180 80, 220 80, 240 90 L 235 65 C 215 58, 185 58, 165 65 Z"
            fill={color}
            stroke="#11241B"
            strokeWidth="3"
          />
        ) : collar === 'shirt' ? (
          <path
            d="M 155 90 L 180 120 L 200 95 L 220 120 L 245 90 L 235 70 L 165 70 Z"
            fill={color}
            stroke="#11241B"
            strokeWidth="3"
          />
        ) : (
          /* Mandarin / Round Ban */
          <path
            d="M 165 90 C 185 75, 215 75, 235 90 L 230 75 C 210 65, 190 65, 170 75 Z"
            fill={color}
            stroke="#11241B"
            strokeWidth="2.5"
          />
        )}

        {/* Center Placket / Patti */}
        <rect
          x="192"
          y="90"
          width="16"
          height="140"
          rx="2"
          fill="#FAF8F5"
          stroke="#11241B"
          strokeWidth="2"
        />

        {/* Buttons */}
        <circle cx="200" cy="110" r="3" fill={buttons === 'metal' ? '#C5A880' : '#1C3A2B'} stroke="#222" strokeWidth="0.5" />
        <circle cx="200" cy="140" r="3" fill={buttons === 'metal' ? '#C5A880' : '#1C3A2B'} stroke="#222" strokeWidth="0.5" />
        <circle cx="200" cy="170" r="3" fill={buttons === 'metal' ? '#C5A880' : '#1C3A2B'} stroke="#222" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="3" fill={buttons === 'metal' ? '#C5A880' : '#1C3A2B'} stroke="#222" strokeWidth="0.5" />

        {/* Chest Pocket */}
        <path
          d="M 140 160 L 165 160 L 165 190 L 152.5 198 L 140 190 Z"
          fill="none"
          stroke="#11241B"
          strokeWidth="2"
          strokeDasharray="2,2"
        />

        {/* Side Pockets / Slits */}
        <line x1="125" y1="280" x2="125" y2="350" stroke="#11241B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="275" y1="280" x2="275" y2="350" stroke="#11241B" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-white px-2 py-0.5 border border-border">Collar: <b className="capitalize text-primary">{collar}</b></span>
        <span className="rounded-md bg-white px-2 py-0.5 border border-border">Sleeves: <b className="capitalize text-primary">{sleeves}</b></span>
        <span className="rounded-md bg-white px-2 py-0.5 border border-border">Daman: <b className="capitalize text-primary">{daman}</b></span>
        <span className="rounded-md bg-white px-2 py-0.5 border border-border">Buttons: <b className="capitalize text-primary">{buttons}</b></span>
      </div>
    </div>
  );
}
