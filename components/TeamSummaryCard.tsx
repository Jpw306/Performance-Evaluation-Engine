export default function TeamSummaryCard() {
  const mockTeam = {
    name: 'HackSquad',
    members: [
      { name: 'Nate', commits: 15, clashWins: 12 },
      { name: 'Ava', commits: 22, clashWins: 8 },
      { name: 'Leo', commits: 10, clashWins: 15 },
    ],
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400">{mockTeam.name}</h2>
      <div className="space-y-2">
        {mockTeam.members.map((m) => (
          <div key={m.name} className="flex justify-between bg-neutral-800 p-3 rounded-lg">
            <span>{m.name}</span>
            <span className="text-yellow-400">{m.clashWins} wins / {m.commits} commits</span>
          </div>
        ))}
      </div>
    </div>
  );
}
