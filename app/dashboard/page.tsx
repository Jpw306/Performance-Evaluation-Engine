'use client';

import NavBar from '@/components/NavBar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/useUser';
import { Group } from '@/models/group';
import { GroupLogin } from '@/models/user';
import React, { useEffect } from 'react';

interface GroupCardProps {
    group: GroupLogin;
};

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {

    const handleClick = () => {
        // Redirect to the dashboard
        window.location.href = '/dashboard/' + group.id;
    };
    return (
        <Card onClick={handleClick}>
            <br></br>
            <CardHeader>
                <CardTitle>{group.name || 'Unnamed Group'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mt-4 text-sm">
                    <p className='text-clash-black'>Members: {group.numMembers || 0}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const DashTemp = () => {

    const { user } = useUser();
    
    const [githubData, setGithubData] = React.useState<any>(null);
    const [clashData, setClashData] = React.useState<any>(null);
    
    // Add loading states
    const [githubLoading, setGithubLoading] = React.useState(false);
    const [clashLoading, setClashLoading] = React.useState(false);

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

    const fetchCommits = async () => {
        if(user?.githubUsername) {
            setGithubLoading(true);
            try {
                const response = await fetch('/api/github', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if(response.ok) {
                    const data = await response.json();
                    setGithubData(data);
                }
                else {
                    console.error('Failed to fetch commit data');
                    setGithubData(null); // Explicitly set to null on failure
                }
            }
            catch(error) {
                console.log('Error getting GitHub data:', error);
                setGithubData(null); // Explicitly set to null on error
            }
            finally {
                setGithubLoading(false);
            }
        }
    }

    const fetchClashData = async () => {
        if(user?.clashRoyaleTag) {
            setClashLoading(true);
            try {
                const response = await fetch('/api/get-player?userId=' + user.clashRoyaleTag, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if(response.ok) {
                    const data = await response.json();
                    setClashData(data);
                }
                else {
                    console.error('Failed to fetch clash data');
                    setClashData(null); // Explicitly set to null on failure
                }
            }
            catch (error) {
                console.error('Error fetching clash data:', error);
                setClashData(null); // Explicitly set to null on error
            }
            finally {
                setClashLoading(false);
            }
        }
    };

    // Helper functions to determine display text
    const getGithubDisplayText = () => {
        if (githubLoading) return 'Loading...';
        if (githubData && githubData.commits !== undefined) {
            return `${githubData.commits} commits`;
        }
        return 'Data not found';
    };

    const getClashDisplayText = () => {
        if (clashLoading) return 'Loading...';
        
        // Fix: Check for both null and undefined
        if (clashData && clashData !== null) {
            let returnString = "";
            if (clashData.trophies !== undefined) {
                returnString += clashData.trophies + " trophies\n";
            }
            if (clashData.wins !== undefined) {
                returnString += clashData.wins + " wins\n";
            }
            if (clashData.losses !== undefined) {
                returnString += clashData.losses + " losses\n";
            }
            if (clashData.battleCount !== undefined) {
                returnString += clashData.battleCount + " total battles\n"; // Fixed typo: battleCounr -> battleCount
            }
            return returnString || "Stats Unavailable"; // Return the string or fallback to wins
        }
        
        return 'Data not found';
    };
        
    useEffect(() => {
        fetchCommits();
        fetchClashData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
            <div className='flex flex-col gap-8 p-8 w-3/4 mx-auto'>
                <NavBar></NavBar>
                <div className='flex flex-row items-start gap-8'>
                    {/* Profile Picture Section - 1/3 width */}
                    <div className='w-1/3 flex flex-col items-center gap-4 bg-clash-dark'>
                        <Avatar style={{ width: '256px', height: '256px' }} className="rounded-full">
                            {
                                user?.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user?.name} style={{ width: '256px', height: '256px' }} />
                                ) : (
                                    <AvatarFallback className="text-2xl" style={{ width: '256px', height: '256px' }}>{user?.name?.[0] ?? ''}</AvatarFallback>
                                )
                            }
                        </Avatar>
                        <div>
                            <br></br>
                            {user?.name}
                        </div>
                        <div className="text-center">
                            <h3>GitHub Commits</h3>
                            <p className="text-clash-white">
                                {getGithubDisplayText()}
                            </p>
                            <h3>Clash Stats</h3>
                            <p className="text-clash-white whitespace-pre-line">
                                {getClashDisplayText()}
                            </p>
                        </div>
                    </div>
                    
                    {/* Group Cards Section - 2/3 width */}
                    <div className='w-2/3'>
                        {user?.groups.length || 0 > 0 ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                                {user?.groups.map((group, index) => (
                                    <GroupCard key={index} group={group} />
                                ))}
                            </div>
                        ) : (
                            <div className='flex items-center justify-center h-64'>
                                <p className='text-clash-white text-lg text-center'>
                                    You are currently not in any groups
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DashTemp;
