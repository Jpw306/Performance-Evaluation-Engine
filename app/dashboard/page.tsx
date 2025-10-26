import CompassGrid from '@/components/CompassGrid';
import LeaderboardTable from '@/components/LeaderboardTable';
import NavBar from '@/components/NavBar';
import { mockPlayers } from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-clash-light p-8">
      <NavBar />
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <section className="col-span-8 bg-clash-dark p-6 rounded-2xl shadow-md">
          <h2 className="text-3xl font-headline text-clash-gold mb-4 drop-shadow">Team Compass</h2>
          <CompassGrid />
        </section>

        <aside className="col-span-4">
          <section className="bg-clash-blue p-4 rounded-2xl mb-6 shadow">
            <h3 className="text-lg font-headline text-clash-gold mb-3">Leaderboard</h3>
            <LeaderboardTable />
          </section>

          <section className="bg-clash-white p-4 rounded-2xl shadow">
            <h3 className="text-lg font-headline text-clash-blue mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm text-clash-black">
              <div className="flex justify-between"><span>Active players</span><span>{mockPlayers.length}</span></div>
              <div className="flex justify-between"><span>Top scorer</span><span>{mockPlayers[0].name}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
