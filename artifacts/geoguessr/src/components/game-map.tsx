import React, { useRef, useCallback } from 'react';

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

export default function GameMap({ onGuessSelect, guessCoords, guessResult, isRoundOver }: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isRoundOver) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    // lng = x%, lat = y%
    onGuessSelect({ lat: yPct, lng: xPct });
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

      {/* Guess pin */}
      {guessCoords && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: `${guessCoords.lng}%`, top: `${guessCoords.lat}%` }}
        >
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#3b82f6" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>
        </div>
      )}

      {/* Correct pin + line */}
      {isRoundOver && guessResult && guessCoords && (
        <>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <line
              x1={`${guessCoords.lng}%`}
              y1={`${guessCoords.lat}%`}
              x2={`${guessResult.correctLng}%`}
              y2={`${guessResult.correctLat}%`}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ left: `${guessResult.correctLng}%`, top: `${guessResult.correctLat}%` }}
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#22c55e" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </div>
        </>
      )}

      {!isRoundOver && !guessCoords && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-xs font-mono px-3 py-1 rounded border border-border text-muted-foreground pointer-events-none">
          Click on the map to place your guess
        </div>
      )}
    </div>
  );
}
