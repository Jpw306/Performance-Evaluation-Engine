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
    const maxCommits = Math.max(...mockPlayers.map(p => p.commits));
    const maxWin = Math.max(...mockPlayers.map(p => p.wins / (p.wins + p.losses)));
    return mockPlayers.map(p => {
      const commitRatio = p.commits / maxCommits;
      const winRatio = p.wins / (p.wins + p.losses);
      const score = (commitRatio + winRatio) / 2;
      return { ...p, commitRatio, winRatio, score };
    });
  }, []);

  const bestPlayer = players.reduce((a, b) => (a.score > b.score ? a : b));

  return (
    <div className="relative w-[600px] h-[600px] bg-clash-dark border-2 border-clash-gray rounded-3xl overflow-hidden mx-auto">
      {/* 4-quadrant grid */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-clash-gray/40" />
        ))}
      </div>

      {/* Axis labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-clash-gray text-sm font-clash uppercase tracking-tightest">
        ↑ Win Rate
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-clash-gray text-sm font-clash uppercase tracking-tightest">
        Commit Rate →
      </div>

      {/* Quadrant titles */}
      <div className="absolute top-[10%] left-[15%] text-clash-light font-clash uppercase text-xs">
        Slacker Loser
      </div>
      <div className="absolute top-[10%] right-[15%] text-clash-light font-clash uppercase text-xs">
        Committed Loser
      </div>
      <div className="absolute bottom-[10%] left-[15%] text-clash-light font-clash uppercase text-xs">
        Slacker Winner
      </div>
      <div className="absolute bottom-[10%] right-[15%] text-clash-light font-clash uppercase text-xs">
        Committed Winner
      </div>

      {/* Player markers */}
      {players.map(p => {
        const left = `${10 + p.commitRatio * 80}%`;
        const top = `${85 - p.winRatio * 80}%`;

        return (
          <div
            key={p.id}
            className="absolute flex flex-col items-center"
            style={{ left, top }}
          >
            <div className="relative">
              {bestPlayer.id === p.id && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-clash-gold text-xl">
                  👑
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-clash-blue border-2 border-clash-white flex items-center justify-center overflow-hidden shadow-md">
                {p.avatar ? (
                  <Image src={p.avatar} alt={p.name} width={48} height={48} />
                ) : (
                  <span className="text-lg font-bold text-clash-white">{p.name[0]}</span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-clash-light font-clash uppercase tracking-tightest">
              {p.name}
            </p>
          </div>
        );
      })}

      {/* Animated marker for current user */}
      <motion.div
        className="absolute w-14 h-14 rounded-full overflow-hidden border-2 border-clash-white shadow-2xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{
          left: `${10 + bestPlayer.commitRatio * 80}%`,
          top: `${85 - bestPlayer.winRatio * 80}%`,
        }}
      >
        <Image src={mockUser.avatar} alt={mockUser.name} width={56} height={56} />
      </motion.div>
    </div>
  );
}
