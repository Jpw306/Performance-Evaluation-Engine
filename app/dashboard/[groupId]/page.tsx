'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/lib/useUser";
import CompassGrid from "@/components/CompassGrid";
import Leaderboard from "@/components/LeaderboardTable";

interface GroupMember {
  id: string;
  name: string;
  photoIcon: string;
  githubUsername: string;
  commits: number;
  winRate: number;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const params = useParams<{ groupId?: string }>();
  const groupId = params?.groupId;
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("DashboardPage mounted with groupId:", groupId);
    const fetchGroup = async () => {
      if (!groupId) return;
        try {
          console.log("fetching group data for groupID:", groupId);
          const res = await fetch(`/api/group/${groupId}`);
          console.log("response")
          if (!res.ok) throw new Error("Failed to fetch group");
          const data = await res.json();
          setMembers(data.people || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
    };
    fetchGroup();
  }, [groupId]);

  if (loading || userLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-clash-light font-clash text-lg">
        Loading group data...
      </div>
    );

  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center text-clash-white p-8 font-text flex flex-col items-center">
      <h1 className="font-clash text-4xl uppercase tracking-tightest text-clash-gold mb-10">
        {user?.name}'s Group Dashboard
      </h1>

      <section className="flex flex-col gap-16 w-full max-w-5xl items-center">
        <CompassGrid members={members} />
        <Leaderboard members={members} />
      </section>
    </main>
  );
}
