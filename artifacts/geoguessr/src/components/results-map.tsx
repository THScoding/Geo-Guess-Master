import React from 'react';
import { RoundResult } from '@workspace/api-client-react';

// Coordinate system:
//   (0, 0)     = image center
//   (-100,-100) = bottom-left
//   (+100,+100) = top-right

const HALF = 100;
const COLORS = ['#f59e0b', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

function xToPercent(lng: number) {
  return `${((lng + HALF) / (HALF * 2)) * 100}%`;
}

function yToPercent(lat: number) {
  return `${((HALF - lat) / (HALF * 2)) * 100}%`;
}

interface ResultsMapProps {
  results: RoundResult[];
}

export default function ResultsMap({ results }: ResultsMapProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-muted/20">
      <img
        src="/map.png"
        alt="Results map"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {results.map((round, i) => (
          <line
            key={`line-${i}`}
            x1={xToPercent(round.guessLng)}
            y1={yToPercent(round.guessLat)}
            x2={xToPercent(round.correctLng)}
            y2={yToPercent(round.correctLat)}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="2"
            strokeDasharray="7 4"
            strokeLinecap="round"
            opacity="0.85"
          />
        ))}
      </svg>

      {results.map((round, i) => (
        <React.Fragment key={`pins-${i}`}>
          {/* Guess pin — grey, faded */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none opacity-60"
            style={{ left: xToPercent(round.guessLng), top: yToPercent(round.guessLat) }}
          >
            <svg width="18" height="27" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#6b7280" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </div>
          {/* Correct pin — coloured, numbered */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ left: xToPercent(round.correctLng), top: yToPercent(round.correctLat) }}
            title={`Round ${round.round}: ${round.locationName} — ${round.score} pts`}
          >
            <svg width="22" height="33" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="2"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{round.round}</text>
            </svg>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
