'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
        window.location.href = '/dashboard/' + id;
    };

    return (
        <Card onClick={handleClick}>
            <CardHeader>
                <CardTitle>Sample Group Name</CardTitle>
            </CardHeader>
            <CardContent>
                <p>This is a sample group with static text content. It shows what a group card would look like.</p>
                <div className="mt-4 text-sm">
                    <p>Members: 5</p>
                    <p>Created: 2 weeks ago</p>
                    {
                        group.createdAt && (
                            <p>Created: {new Date(group.createdAt).toLocaleDateString()}</p>
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
        <div className='flex flex-col gap-8 p-8 w-3/4 mx-auto'>
            <div className='flex flex-row space-between items-center'>
                <div>
                    Welcome back, <span className='font-bold'>{user?.name}</span>!
                </div>
                <div>
                    <Button variant="outline">Create Group</Button>
                    <Button variant="outline">Join Group</Button>
                </div>
            </div>
            <div className='flex flex-row items-center gap-4'>
                <Avatar className="w-8 h-8 rounded-full">
                    {
                        user?.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user?.name} />
                        ) : (
                            <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
                        )
                    }
                </Avatar>
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {groups.map((group, index) => (
                        <GroupCard key={index} id={groupIds[index]} group={group} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashTemp;
