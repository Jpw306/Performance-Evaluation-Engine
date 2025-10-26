import GroupLeaderboard from '@/components/GroupLeaderboard';
import LeaderboardTable from '@/components/LeaderboardTable';
import NavBar from '@/components/NavBar';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
      <NavBar />
      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-3xl font-headline mb-6 text-clash-gold drop-shadow">Leaderboard</h1>
        <GroupLeaderboard/>
      </div>
    </main>
  );
}
