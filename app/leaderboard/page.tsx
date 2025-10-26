import GroupLeaderboard from '@/components/GroupLeaderboard';
import LeaderboardTable from '@/components/LeaderboardTable';
import MainLayout from '../layouts/MainLayout';

export default function LeaderboardPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto mt-10">
          <h1 className="text-3xl font-headline mb-6 text-clash-gold drop-shadow">Leaderboard</h1>
          <GroupLeaderboard/>
        </div>
      </div>
    </MainLayout>
  );
}
