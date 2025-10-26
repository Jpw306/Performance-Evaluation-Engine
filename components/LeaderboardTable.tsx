import { mockPlayers } from '@/lib/mockData';

export default function LeaderboardTable() {
  return (
    <table className='w-full border-collapse border border-clash-gray text-center bg-supercell-gray'>
      <thead className='bg-clash-black text-supercell-yellow font-headline uppercase tracking-tightest'>
        <tr>
          <th className="p-3">Rank</th>
          <th className="p-3">Player</th>
          <th className="p-3">Commits per Month</th>
          <th className="p-3">Clash Win Rate</th>
        </tr>
      </thead>
      <tbody className="bg-clash-dark">
        {mockPlayers.map((p) => (
          <tr key={p.rank} className="border-t border-clash-gray/40 bg-clash-dark hover:bg-supercell-mediumGray/20">
            <td className="p-3 font-bold">{p.rank}</td>
            <td className="p-3 uppercase font-headline">{p.name}</td>
            <td className="p-3 font-bold">{p.commits}</td>
            <td className="p-3 font-bold">{((p.wins / (p.wins + p.losses)) * 100).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
