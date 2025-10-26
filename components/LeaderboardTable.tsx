'use client';

import Image from 'next/image';

interface Member {
  id: string;
  name: string;
  photoIcon?: string;
  commits: number;
  winRate: number;
}

interface Props {
  members: Member[];
}

export default function LeaderboardTable({ members }: Props) {
  const sorted = [...members].sort(
    (a, b) =>
      b.commits + b.winRate * 100 - (a.commits + a.winRate * 100)
  );

  return (
    <div className="w-full max-w-[800px] bg-clash-dark rounded-2xl border-[3px] border-clash-goldDark p-6">
      <h3 className="font-clash text-2xl uppercase tracking-tightest text-clash-gold mb-4 text-center">
        Leaderboard
      </h3>

      <table className="w-full border-collapse text-center text-clash-light font-clash uppercase tracking-tightest">
        <thead className="bg-clash-black text-clash-gold border-b border-clash-gray/50">
          <tr>
            <th className="p-3">Rank</th>
            <th className="p-3">Player</th>
            <th className="p-3">Commits</th>
            <th className="p-3">Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr
              key={p.id || `member-${i}`}
              className="border-t border-clash-gray/40 hover:bg-clash-gold/5"
            >
              <td className="p-3">{i + 1}</td>
              <td className="p-3 flex items-center justify-center gap-3">
                {p.photoIcon && (
                  <Image
                    src={p.photoIcon}
                    alt={p.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-clash-gold"
                  />
                )}
                <span>{p.name}</span>
              </td>
              <td className="p-3">{p.commits}</td>
              <td className="p-3">{(p.winRate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
