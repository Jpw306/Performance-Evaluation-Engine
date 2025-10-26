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
    <div className="clash-leaderboard w-full max-w-4xl mx-auto">
      <h2 className="clash-leaderboard-title">
        Group Leaderboard
      </h2>
      <table className="clash-leaderboard-table">
        <thead>
          <tr>
            <th className="clash-leaderboard-header text-left">Rank</th>
            <th className="clash-leaderboard-header text-left">Group</th>
            <th className="clash-leaderboard-header text-right">Avg Commits</th>
            <th className="clash-leaderboard-header text-right">Avg Win Rate (%)</th>
            <th className="clash-leaderboard-header text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((g, index) => (
            <tr key={g.id} className={index === 0 ? 'text-clash-gold font-bold' : ''}>
              <td className="clash-leaderboard-cell text-center">#{index + 1}</td>
              <td className="clash-leaderboard-cell">{g.name}</td>
              <td className="clash-leaderboard-cell text-right">{g.avgCommits.toFixed(1)}</td>
              <td className="clash-leaderboard-cell text-right">{g.avgWinRate.toFixed(1)}</td>
              <td className="clash-leaderboard-cell text-right font-semibold">
                {g.score.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
