'use client';

import { useEffect, useState } from 'react';

interface GroupLeaderboardEntry {
  id: string;
  name: string;
  avgCommits: number;
  avgWinRate: number;
  score: number;
}

export default function GroupLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/group/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading)
    return (
      <div className="text-clash-light font-clash text-lg">
        Loading group leaderboard...
      </div>
    );

  return (
    <div className="w-full max-w-4xl bg-clash-dark border border-clash-blue rounded-2xl p-6 shadow-lg">
      <h2 className="text-3xl font-clash text-clash-gold mb-4 text-center uppercase">
        Group Leaderboard
      </h2>
      <table className="w-full text-left text-clash-white border-collapse">
        <thead>
          <tr className="text-clash-blue border-b border-clash-blue/50">
            <th className="p-2">Rank</th>
            <th className="p-2">Group</th>
            <th className="p-2 text-right">Avg Commits</th>
            <th className="p-2 text-right">Avg Win Rate (%)</th>
            <th className="p-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((g, index) => (
            <tr
              key={g.id}
              className={`hover:bg-clash-blue/10 transition ${
                index === 0 ? 'text-clash-gold font-bold' : ''
              }`}
            >
              <td className="p-2 text-center">#{index + 1}</td>
              <td className="p-2">{g.name}</td>
              <td className="p-2 text-right">{g.avgCommits.toFixed(1)}</td>
              <td className="p-2 text-right">{g.avgWinRate.toFixed(1)}</td>
              <td className="p-2 text-right text-clash-green font-semibold">
                {g.score.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
