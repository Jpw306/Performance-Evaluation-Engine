'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/useUser';
import { Group } from '@/models/group';
import React, { useEffect } from 'react';

interface GroupCardProps {
    id: string;
    group: Group;
};

const GroupCard: React.FC<GroupCardProps> = ({ id, group }) => {

    const handleClick = () => {
        // Redirect to the dashboard
        window.location.href = '/dashboard/' + id;
    };
    return (
        <Card onClick={handleClick}>
            <br></br>
            <CardHeader>
                <CardTitle>Sample Group Name</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-clash-black">This is a sample group with static text content. It shows what a group card would look like.</p>
                <div className="mt-4 text-sm">
                    <p className="text-clash-black">Members: 5</p>
                    <p className="text-clash-black">Created: 2 weeks ago</p>
                    {
                        group.createdAt && (
                            <p className="text-clash-black">Created: {new Date(group.createdAt).toLocaleDateString()}</p>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    );
};

const DashTemp = () => {

    const { user } = useUser();
    
    const [groupIds, setGroupIds] = React.useState<string[]>([]);
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [githubData, setGithubData] = React.useState<any>(null);
    const [clashData, setClashData] = React.useState<any>(null);

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

    const fetchCommits = async () => {
        if(user?.githubUsername) {
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
                }
            }
            catch(error) {
                console.log('Error getting GitHub data:', error);
            }
        }
    }

    const fetchClashData = async () => {
        if(user?.clashRoyaleTag) {
            try {
                const response = await fetch('/api/clash', {
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
                }
            }
            catch (error) {
                console.error('Error fetching clash data:', error);
            }
        }
    };
        
    useEffect(() => {
        fetchGroups();
        fetchCommits();
        fetchClashData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className='flex flex-col gap-8 p-8 w-3/4 mx-auto'>
            <div>
                Welcome {user?.name},
            </div>
            <div className='flex flex-row items-start gap-8'>
                {/* Profile Picture Section - 1/3 width */}
                <div className='w-1/3 flex flex-col items-center gap-4'>
                    <Avatar style={{ width: '256px', height: '256px' }} className="rounded-full">
                        {
                            user?.photoIcon ? (
                                <AvatarImage src={user.photoIcon} alt={user?.name} style={{ width: '256px', height: '256px' }} />
                            ) : (
                                <AvatarFallback className="text-2xl" style={{ width: '256px', height: '256px' }}>{user?.name?.[0] ?? ''}</AvatarFallback>
                            )
                        }
                    </Avatar>
                    <div className="text-center">
                        <p className="text-clash-white">
                            GitHub Commits: {githubData ? githubData.commitCount || 'Loading...' : 'Loading...'}
                        </p>
                        <p className="text-clash-white">
                            Clash Stats: {clashData ? clashData.wins || 'Loading...' : 'Loading...'}
                        </p>
                    </div>
                </div>
                
                {/* Group Cards Section - 2/3 width */}
                <div className='w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                    {groups.map((group, index) => (
                        <GroupCard key={index} id={groupIds[index]} group={group} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashTemp;
