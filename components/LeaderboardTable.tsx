import { mockPlayers } from '@/lib/mockData';

export default function LeaderboardTable() {
  return (
    <table className='w-full border-collapse border border-supercell-gray text-center'>
      <thead className='bg-supercell-black text-supercell-yellow font-headline uppercase tracking-tightest'>
        <tr>
          <th className="p-3">Rank</th>
          <th className="p-3">Player</th>
          <th className="p-3">Commits per Month</th>
          <th className="p-3">Clash Win Rate</th>
          <th className="p-3">Overall Score</th>
        </tr>
      </thead>
      <tbody className="bg-supercell-darkGray">
        {mockPlayers.map((p) => (
          <tr key={p.rank} className="border-t border-supercell-gray/40 hover:bg-supercell-mediumGray/20">
            <td className="p-3 font-bold">{p.rank}</td>
            <td className="p-3 uppercase font-headline">{p.name}</td>
            <td className="p-3 font-bold">{p.commits}</td>
            <td className="p-3 font-bold">{((p.wins / (p.wins + p.losses)) * 100).toFixed(2)}%</td>
            <td className="p-3 text-supercell-yellow font-headline">{p.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
