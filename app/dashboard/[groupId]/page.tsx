'use client';

import CompassGrid from '@/components/CompassGrid';
import LeaderboardTable from '@/components/LeaderboardTable';
import NavBar from '@/components/NavBar';
import ClashButton from '@/components/ClashButton';
import { mockPlayers } from '@/lib/mockData';
import { useUser } from '@/lib/useUser';
import { Group } from '@/models/group';
import React, { useEffect } from 'react';

const GroupDashboard = () => {
    const { user } = useUser();
    
    const [groupIds, setGroupIds] = React.useState<string[]>([]);
    const [groups, setGroups] = React.useState<Group[]>([]);

    const fetchGroupData = async (groupId: string) => {
        try
        {
            const response = await fetch(`/api/group/${groupId}`);
            if (response.ok) {
                const groupData = await response.json();
                return groupData as Group;
            }
        } catch (error)
        {
            console.error('Error fetching group data:', error);
        }
        return null;
    };

    const fetchGroups = async () => {
        if (user?.groups && user.groups.length > 0)
        {
            try
            {
                const response = await fetch('/api/user?githubUsername=' + user.githubUsername, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    setGroupIds(data.groups);

                    const tmp: Group[] = [];
                    await Promise.all(data.groups.map(async (groupId: string) => {
                        const groupData = await fetchGroupData(groupId);
                        if (groupData)
                            tmp.push(groupData);
                    }));

                    setGroups(tmp);
                } else
                    console.error('Failed to fetch groups');
            }
            catch (error)
            {
                console.error('Error fetching groups:', error);
            }
        }
    };
        
    useEffect(() => {

        fetchGroups();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
  
    return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
      <NavBar />
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <section className="col-span-8 p-6 rounded-2xl shadow-md">
          <h2 className="text-3xl font-headline text-clash-gold mb-4 drop-shadow">Team Compass</h2>
          <CompassGrid />
        </section>

        <aside className="col-span-4">
          <section className="bg-clash-blue p-4 rounded-2xl mb-6 shadow">
            <h3 className="text-lg font-headline text-clash-gold mb-3">Leaderboard</h3>
            <LeaderboardTable />
          </section>

          <section className="bg-clash-white p-4 rounded-2xl shadow">
            <h3 className="text-lg font-headline text-clash-blue mb-12 mt-12">Quick Stats</h3>
            <div className="space-y-2 text-sm text-clash-black">
              <div className="flex justify-between"><span>Active players</span><span>{mockPlayers.length}</span></div>
              <div className="flex justify-between"><span>Top scorer</span><span>{mockPlayers[0].name}</span></div>
                <ClashButton/>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default GroupDashboard;
