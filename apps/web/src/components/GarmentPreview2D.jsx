import React from 'react';

export default function GarmentPreview2D({
  collar = 'sherwani',
  neckline = 'placket',
  sleeves = 'cuff',
  daman = 'round',
  buttons = 'metal',
  color = '#1C3A2B'
}) {
  // Determine if color is light or dark for optimal contrast
  const isLight = ['#ffffff', '#faf9f6', '#f0ece1', '#eadbbe', '#f4efe6'].includes(color.toLowerCase());
  const stitchColor = isLight ? '#8B7355' : 'rgba(255, 255, 255, 0.45)';
  const shadowColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.35)';

  return (
    <div className="relative flex flex-col items-center justify-center rounded-3xl border border-slate-200/90 bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#ECE5D8] p-5 sm:p-7 shadow-lg">
      {/* Header bar with plain, simple wording */}
      <div className="flex w-full items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <p className="font-serif text-sm font-bold text-[#1C3A2B]">
            Suit Ka Real Fit &amp; Style Preview
          </p>
        </div>
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200">
          Master Darzi Cut
        </span>
      </div>

      {/* Realistic Garment Canvas */}
      <div className="relative w-full max-w-[340px] flex items-center justify-center py-2">
        <svg
          viewBox="0 0 420 560"
          className="w-full drop-shadow-xl transition-all duration-300"
          style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))' }}
        >
          <defs>
            {/* Soft lighting gradient over garment */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.88" />
              <stop offset="35%" stopColor={color} stopOpacity="1" />
              <stop offset="70%" stopColor={color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={color} stopOpacity="0.82" />
            </linearGradient>

            <linearGradient id="foldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
            </linearGradient>

            {/* Brass / Metal button gradient */}
            <radialGradient id="brassBtn" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF1D0" />
              <stop offset="45%" stopColor="#C5A880" />
              <stop offset="100%" stopColor="#7A5826" />
            </radialGradient>

            {/* Fabric button gradient */}
            <radialGradient id="fabricBtn" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="70%" stopColor={color} />
              <stop offset="100%" stopColor="#111111" />
            </radialGradient>

            {/* Subtle linen texture */}
            <pattern id="linenWeave" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* 1. Lower Shalwar (Legs visible beneath kurta hem) */}
          <g id="shalwar">
            {/* Left Leg */}
            <path
              d="M 160 410 L 140 530 L 180 530 L 195 410 Z"
              fill={color}
              opacity="0.92"
            />
            {/* Right Leg */}
            <path
              d="M 225 410 L 240 530 L 280 530 L 260 410 Z"
              fill={color}
              opacity="0.92"
            />
            {/* Paincha Stitches */}
            <line x1="140" y1="524" x2="180" y2="524" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="140" y1="527" x2="180" y2="527" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="240" y1="524" x2="280" y2="524" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="240" y1="527" x2="280" y2="527" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
          </g>

          {/* 2. Kurta Main Body with organic shoulders & waist taper */}
          <g id="kurta-body">
            <path
              d={
                daman === 'round'
                  ? "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 410 Q 210 448 128 410 L 134 274 L 100 280 L 85 120 Z"
                  : "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 422 L 128 422 L 134 274 L 100 280 L 85 120 Z"
              }
              fill="url(#bodyGradient)"
              stroke={shadowColor}
              strokeWidth="2"
            />

            {/* Linen Texture Overlay */}
            <path
              d={
                daman === 'round'
                  ? "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 410 Q 210 448 128 410 L 134 274 L 100 280 L 85 120 Z"
                  : "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 422 L 128 422 L 134 274 L 100 280 L 85 120 Z"
              }
              fill="url(#linenWeave)"
            />

            {/* Natural Drape / Lighting Overlay */}
            <path
              d={
                daman === 'round'
                  ? "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 410 Q 210 448 128 410 L 134 274 L 100 280 L 85 120 Z"
                  : "M 150 78 Q 210 92 270 78 L 335 120 L 320 280 L 286 274 L 292 422 L 128 422 L 134 274 L 100 280 L 85 120 Z"
              }
              fill="url(#foldGradient)"
            />

            {/* Shoulder Seams (Teera Stitch) */}
            <line x1="150" y1="78" x2="210" y2="92" stroke={stitchColor} strokeWidth="1.2" strokeDasharray="3,2" />
            <line x1="210" y1="92" x2="270" y2="78" stroke={stitchColor} strokeWidth="1.2" strokeDasharray="3,2" />

            {/* Natural Draped Fabric Crease Lines */}
            <path d="M 160 170 Q 185 240 180 340" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 260 170 Q 235 240 240 340" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.4" />

            {/* Side Slits (Chaak) */}
            <line x1="134" y1="274" x2="134" y2="390" stroke={shadowColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="286" y1="274" x2="286" y2="390" stroke={shadowColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Bottom Hem Stitch Line */}
            {daman === 'round' ? (
              <path d="M 130 405 Q 210 443 290 405" stroke={stitchColor} strokeWidth="1.2" strokeDasharray="3,2" fill="none" />
            ) : (
              <line x1="130" y1="417" x2="290" y2="417" stroke={stitchColor} strokeWidth="1.2" strokeDasharray="3,2" />
            )}
          </g>

          {/* 3. Sleeves & Cuffs with natural hang */}
          <g id="sleeves">
            {/* Left Arm Body */}
            <path d="M 125 110 L 85 120 L 100 280 L 130 265 Z" fill={color} opacity="0.95" />
            {/* Right Arm Body */}
            <path d="M 295 110 L 335 120 L 320 280 L 290 265 Z" fill={color} opacity="0.95" />

            {/* Arm Inseam Stitch */}
            <line x1="125" y1="110" x2="100" y2="280" stroke={shadowColor} strokeWidth="1.5" opacity="0.3" />
            <line x1="295" y1="110" x2="320" y2="280" stroke={shadowColor} strokeWidth="1.5" opacity="0.3" />

            {sleeves === 'cuff' ? (
              <>
                {/* Left Tailored Cuff */}
                <rect x="94" y="275" width="38" height="20" rx="3" fill="#FFFFFF" stroke={shadowColor} strokeWidth="1.5" />
                <line x1="97" y1="285" x2="129" y2="285" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
                <circle
                  cx="113"
                  cy="285"
                  r="3.5"
                  fill={buttons === 'metal' ? 'url(#brassBtn)' : 'url(#fabricBtn)'}
                  stroke="#333"
                  strokeWidth="0.5"
                />

                {/* Right Tailored Cuff */}
                <rect x="288" y="275" width="38" height="20" rx="3" fill="#FFFFFF" stroke={shadowColor} strokeWidth="1.5" />
                <line x1="291" y1="285" x2="323" y2="285" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
                <circle
                  cx="307"
                  cy="285"
                  r="3.5"
                  fill={buttons === 'metal' ? 'url(#brassBtn)' : 'url(#fabricBtn)'}
                  stroke="#333"
                  strokeWidth="0.5"
                />
              </>
            ) : (
              <>
                {/* Open Straight Bazu Stitched Hem */}
                <line x1="98" y1="276" x2="132" y2="263" stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="288" y1="263" x2="322" y2="276" stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,2" />
              </>
            )}
          </g>

          {/* 4. Center Placket (Front Patti) with crisp bespoke stitching */}
          <g id="placket">
            {/* Placket Underlayer / Shadow */}
            <rect x="201" y="90" width="18" height="152" rx="2" fill="#000000" opacity="0.15" />
            {/* Placket Fabric */}
            <rect
              x="202"
              y="88"
              width="16"
              height="150"
              rx="2"
              fill={color}
              stroke={shadowColor}
              strokeWidth="1.5"
            />
            {/* Placket Edge Topstitching */}
            <line x1="204" y1="90" x2="204" y2="236" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="216" y1="90" x2="216" y2="236" stroke={stitchColor} strokeWidth="1" strokeDasharray="2,2" />

            {/* Triangle Placket Bottom (Bespoke Tukki Cut) */}
            <polygon points="202,238 210,246 218,238" fill={color} stroke={shadowColor} strokeWidth="1.5" />

            {/* Luxury Buttons */}
            {[110, 142, 174, 206].map((btnY) => (
              <g key={btnY}>
                {/* Button Thread Cross */}
                <circle
                  cx="210"
                  cy={btnY}
                  r="4.2"
                  fill={buttons === 'metal' ? 'url(#brassBtn)' : 'url(#fabricBtn)'}
                  stroke="#222"
                  strokeWidth="0.6"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                />
                <circle cx="210" cy={btnY} r="1.2" fill="#333" opacity="0.6" />
              </g>
            ))}
          </g>

          {/* 5. Chest Pocket (Jeb) */}
          <g id="chest-pocket">
            <path
              d="M 148 152 L 176 152 L 176 186 L 162 194 L 148 186 Z"
              fill={color}
              stroke={shadowColor}
              strokeWidth="1.2"
            />
            <path
              d="M 150 154 L 174 154 L 174 184 L 162 191 L 150 184 Z"
              fill="none"
              stroke={stitchColor}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </g>

          {/* 6. Collar / Ban */}
          <g id="collar">
            {collar === 'sherwani' ? (
              // High Sherwani Ban (Khara Ban) with crisp inner curve
              <g>
                <path
                  d="M 166 84 C 182 66, 238 66, 254 84 L 250 56 C 234 46, 186 46, 170 56 Z"
                  fill={color}
                  stroke={shadowColor}
                  strokeWidth="2"
                />
                <path
                  d="M 170 80 C 184 68, 236 68, 250 80"
                  stroke={stitchColor}
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                  fill="none"
                />
              </g>
            ) : collar === 'shirt' ? (
              // Folded Shirt Collar
              <g>
                <path
                  d="M 162 82 L 186 116 L 210 88 L 234 116 L 258 82 L 246 58 L 174 58 Z"
                  fill={color}
                  stroke={shadowColor}
                  strokeWidth="2"
                />
                <polygon points="164,82 186,114 210,88" fill="#ffffff" opacity="0.1" />
                <polygon points="210,88 234,114 256,82" fill="#ffffff" opacity="0.1" />
              </g>
            ) : (
              // Soft Mandarin Round Ban (Gool Ban)
              <g>
                <path
                  d="M 170 84 C 188 70, 232 70, 250 84 L 246 64 C 230 54, 190 54, 174 64 Z"
                  fill={color}
                  stroke={shadowColor}
                  strokeWidth="2"
                />
                <path
                  d="M 174 80 C 190 72, 230 72, 246 80"
                  stroke={stitchColor}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  fill="none"
                />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Clear, simple status chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-xl bg-white px-3 py-1 font-semibold text-slate-800 shadow-sm border border-slate-200">
          Gala: <strong className="text-[#1C3A2B]">{collar === 'sherwani' ? 'Sherwani Ban' : collar === 'shirt' ? 'Shirt Collar' : 'Gool Ban'}</strong>
        </span>
        <span className="rounded-xl bg-white px-3 py-1 font-semibold text-slate-800 shadow-sm border border-slate-200">
          Bazu: <strong className="text-[#1C3A2B]">{sleeves === 'cuff' ? 'Kaf Bazu' : 'Seedha Bazu'}</strong>
        </span>
        <span className="rounded-xl bg-white px-3 py-1 font-semibold text-slate-800 shadow-sm border border-slate-200">
          Ghera: <strong className="text-[#1C3A2B]">{daman === 'round' ? 'Gool Daman' : 'Chakor Daman'}</strong>
        </span>
        <span className="rounded-xl bg-white px-3 py-1 font-semibold text-slate-800 shadow-sm border border-slate-200">
          Button: <strong className="text-[#1C3A2B]">{buttons === 'metal' ? 'Golden Metal' : 'Matching Fabric'}</strong>
        </span>
      </div>
    </div>
  );
}
