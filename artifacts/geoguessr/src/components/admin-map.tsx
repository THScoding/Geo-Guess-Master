import React, { useRef, useCallback } from 'react';

interface AdminMapProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

export default function AdminMap({ lat, lng, onChange }: AdminMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 10000) / 100;
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 10000) / 100;
    onChange(yPct, xPct); // lat=y, lng=x
  }, [onChange]);

  const hasPinXY = lat !== undefined && lng !== undefined && lat !== null && lng !== null && (lat !== 0 || lng !== 0);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full h-full relative overflow-hidden rounded-md border border-border select-none"
      style={{ cursor: 'crosshair', minHeight: '300px' }}
    >
      <img
        src="/map.png"
        alt="Map"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {hasPinXY && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: `${lng}%`, top: `${lat}%` }}
        >
          <svg width="22" height="33" viewBox="0 0 24 36" fill="none">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#f59e0b" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-xs font-mono px-3 py-1 rounded border border-border text-muted-foreground pointer-events-none">
        Click to pin location
      </div>
    </div>
  );
}
