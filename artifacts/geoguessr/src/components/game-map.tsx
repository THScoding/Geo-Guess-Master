import React, { useRef, useCallback } from 'react';

const GRID_SIZE = 200;

interface GameMapProps {
  onGuessSelect: (coords: { lat: number; lng: number }) => void;
  guessCoords: { lat: number; lng: number } | null;
  guessResult?: {
    correctLat: number;
    correctLng: number;
    correctName?: string;
  } | null;
  isRoundOver: boolean;
}

function toPercent(coord: number) {
  return `${(coord / GRID_SIZE) * 100}%`;
}

export default function GameMap({ onGuessSelect, guessCoords, guessResult, isRoundOver }: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isRoundOver) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round(((e.clientX - rect.left) / rect.width) * GRID_SIZE * 100) / 100;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * GRID_SIZE * 100) / 100;
    // lng = x axis, lat = y axis
    onGuessSelect({ lat: y, lng: x });
  }, [isRoundOver, onGuessSelect]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full h-full relative overflow-hidden select-none"
      style={{ cursor: isRoundOver ? 'default' : 'crosshair' }}
    >
      <img
        src="/map.png"
        alt="Game map"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Guess pin (blue) */}
      {guessCoords && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: toPercent(guessCoords.lng), top: toPercent(guessCoords.lat) }}
        >
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#3b82f6" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>
        </div>
      )}

      {/* Result: dashed line + correct pin (green) */}
      {isRoundOver && guessResult && guessCoords && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <line
              x1={toPercent(guessCoords.lng)}
              y1={toPercent(guessCoords.lat)}
              x2={toPercent(guessResult.correctLng)}
              y2={toPercent(guessResult.correctLat)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ left: toPercent(guessResult.correctLng), top: toPercent(guessResult.correctLat) }}
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#22c55e" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </div>
        </>
      )}

      {!isRoundOver && !guessCoords && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-xs font-mono px-3 py-1 rounded border border-border text-muted-foreground pointer-events-none whitespace-nowrap">
          Click on the map to place your guess
        </div>
      )}
    </div>
  );
}
