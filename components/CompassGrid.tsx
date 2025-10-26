'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { mockUser, mockPlayers as dataPlayers } from '../lib/mockData';

interface Player {
  id: number;
  name: string;
  commits: number;
  wins: number;
  losses: number;
  avatar?: string;
}

const mockPlayers: Player[] = dataPlayers;

export default function CompassGrid() {
  const players = useMemo(() => {
    const maxCommits = Math.max(...dataPlayers.map((p) => p.commits));
    return dataPlayers.map((p) => {
      const winRatio = p.wins / (p.wins + p.losses || 1);
      const commitRatio = maxCommits > 0 ? p.commits / maxCommits : 0;
      return { ...p, commitRatio, winRatio };
    });
  }, []);

  return (
    <div className="relative w-[600px] h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-clash-dark to-clash-black border-4 border-clash-white">
      {/* Subtle gold glow background */}
      <div className="absolute inset-0 bg-clash-gold/5 blur-xl pointer-events-none" />

      {/* Crosshair lines - using pixels for visibility */}
      <div 
        className="absolute left-0 right-0 bg-clash-gold/40 z-10" 
        style={{ top: '50%', height: '2px', transform: 'translateY(-1px)' }}
      />
      <div 
        className="absolute top-0 bottom-0 bg-clash-gold/40 z-10" 
        style={{ left: '50%', width: '2px', transform: 'translateX(-1px)' }}
      />

      {/* Axis labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-clash-gray font-clash uppercase tracking-tightest z-20">
        ↑ Win Rate
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-clash-gray font-clash uppercase tracking-tightest z-20">
        Commit Rate →
      </div>

      {/* Quadrant labels - CORRECTED based on axes */}
      <div className="absolute top-8 left-8 text-xs text-clash-light/70 font-clash uppercase tracking-tightest z-20">
        Slacker<br/>Winner
      </div>
      <div className="absolute top-8 right-8 text-xs text-clash-light/70 font-clash uppercase tracking-tightest text-right z-20">
        Committed<br/>Winner
      </div>
      <div className="absolute bottom-8 left-8 text-xs text-clash-light/70 font-clash uppercase tracking-tightest z-20">
        Slacker<br/>Loser
      </div>
      <div className="absolute bottom-8 right-8 text-xs text-clash-light/70 font-clash uppercase tracking-tightest text-right z-20">
        Committed<br/>Loser
      </div>

      {/* Players - using pixel positioning for accuracy */}
      {players.map((p) => {
        // Map ratios to actual pixel positions
        // Container is 600px, leave 60px padding (10% each side)
        const leftPx = 60 + (p.commitRatio * 480); // 60 to 540
        const topPx = 60 + ((1 - p.winRatio) * 480);  // 60 to 540 (inverted for high=top)

        return (
          <div
            key={p.id}
            className="absolute z-30"
            style={{
              left: `${leftPx}px`,
              top: `${topPx}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-clash-blue border-[3px] border-clash-white flex items-center justify-center overflow-hidden shadow-lg">
                {p.avatar ? (
                  <Image 
                    src={p.avatar} 
                    alt={p.name} 
                    width={48} 
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-clash-white">
                    {p.name[0]}
                  </span>
                )}
              </div>
              
              {/* Name */}
              <p className="mt-1 text-xs text-clash-light font-clash uppercase tracking-tightest">
                {p.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}